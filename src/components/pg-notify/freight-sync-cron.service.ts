import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'pg';
import { Freight } from '../../entities/freight.entity';
import { SQSService } from '../sqs/sqs.service';

@Injectable()
export class FreightSyncCronService {
  private readonly logger = new Logger(FreightSyncCronService.name);
  private fretebrasClient: Client;
  private readonly queueUrlFreightCreate: string;
  private isConnecting = false;
  private readonly dbConfig: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    private sqsService: SQSService,
  ) {
    this.queueUrlFreightCreate = this.configService.get('QUEUE_FREIGHT_CREATE');
    
    this.dbConfig = {
      host: this.configService.get('DATABASE_HOST_FRETEBRAS'),
      port: this.configService.get('DATABASE_PORT_FRETEBRAS') || 15432,
      database: this.configService.get('DATABASE_NAME_FRETEBRAS'),
      user: this.configService.get('DATABASE_USERNAME_FRETEBRAS'),
      password: this.configService.get('DATABASE_PASSWORD_FRETEBRAS'),
      connectionTimeoutMillis: 10000,
      query_timeout: 30000,
      keepAlive: true,
    };

    this.connectToFretebras();
  }

  private async connectToFretebras() {
    if (this.isConnecting) {
      this.logger.warn('⚠️ Conexão já em andamento, aguardando...');
      return;
    }

    this.isConnecting = true;

    try {
      // Encerrar conexão antiga se existir
      if (this.fretebrasClient) {
        try {
          await this.fretebrasClient.end();
        } catch (err) {
          // Ignorar erro ao encerrar
        }
      }

      // Criar nova conexão
      this.fretebrasClient = new Client(this.dbConfig);

      // Tratar erros de conexão
      this.fretebrasClient.on('error', (err) => {
        this.logger.error('❌ Erro na conexão Fretebras:', err.message);
        this.reconnectToFretebras();
      });

      this.fretebrasClient.on('end', () => {
        this.logger.warn('⚠️ Conexão Fretebras encerrada, reconectando...');
        this.reconnectToFretebras();
      });

      await this.fretebrasClient.connect();
      this.logger.log('✅ Conectado ao banco Fretebras para sincronização CRON');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao banco Fretebras:', error.message || error);
      this.reconnectToFretebras();
    } finally {
      this.isConnecting = false;
    }
  }

  private reconnectToFretebras() {
    this.logger.log('🔄 Tentando reconectar ao Fretebras em 5 segundos...');
    setTimeout(() => {
      this.connectToFretebras();
    }, 5000);
  }

  private async ensureConnection(): Promise<boolean> {
    try {
      if (!this.fretebrasClient) {
        await this.connectToFretebras();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Testar conexão
      await this.fretebrasClient.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('❌ Conexão não disponível:', error.message);
      this.reconnectToFretebras();
      return false;
    }
  }

  /**
   * Cron job que roda a cada 1 minuto (para testes)
   * Busca fretes do dia no Fretebras e sincroniza com o banco local
   * 
   * Para ajustar o intervalo, altere o valor do decorator @Cron:
   * - A cada 1 minuto: use '0 asterisco asterisco asterisco asterisco asterisco'
   * - A cada 5 minutos: use '0 asterisco/5 asterisco asterisco asterisco asterisco'
   * - A cada 10 minutos: use '0 asterisco/10 asterisco asterisco asterisco asterisco'
   */
  @Cron('0 */10 * * *', {
    name: 'freight-sync',
    timeZone: 'America/Sao_Paulo',
  })
  async syncFreightsFromToday() {
    this.logger.log('🔄 Iniciando sincronização periódica de fretes...');

    try {
      // Garantir que a conexão está ativa
      const isConnected = await this.ensureConnection();
      if (!isConnected) {
        this.logger.error('❌ Conexão com Fretebras não disponível, pulando sincronização');
        return;
      }

      // 1. Buscar fretes do dia atual no banco Fretebras com status AVAILABLE
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      this.logger.log(`📅 Buscando fretes do dia ${todayISO} com status AVAILABLE`);

      const query = `
        SELECT *
        FROM public.fretes
        WHERE DATE(created_at) = CURRENT_DATE
          AND status = 'AVAILABLE'
        ORDER BY created_at DESC
      `;

      const result = await this.fretebrasClient.query(query);
      const freightsFromFretebras = result.rows || [];

      this.logger.log(`📦 Encontrados ${freightsFromFretebras.length} fretes no Fretebras`);

      if (freightsFromFretebras.length === 0) {
        this.logger.log('✅ Nenhum frete para sincronizar');
        return;
      }

      // 2. Extrair IDs dos fretes encontrados
      const fretebrasIds = freightsFromFretebras.map(f => f.id?.toString() || f.external_id?.toString()).filter(Boolean);

      if (fretebrasIds.length === 0) {
        this.logger.warn('⚠️ Nenhum ID válido encontrado nos fretes do Fretebras');
        return;
      }

      this.logger.log(`🔍 Verificando ${fretebrasIds.length} IDs no banco local...`);

      // 3. Verificar quais desses IDs já existem no banco local
      const existingFreights = await this.freightRepository
        .createQueryBuilder('freight')
        .select('freight.id')
        .where('freight.id IN (:...ids)', { ids: fretebrasIds })
        .getMany();

      const existingIds = new Set(existingFreights.map(f => f.id));
      this.logger.log(`✅ ${existingIds.size} fretes já existem no banco local`);

      // 4. Filtrar apenas os fretes que NÃO existem localmente
      const freightsToCreate = freightsFromFretebras.filter(freight => {
        const freightId = freight.id?.toString() || freight.external_id?.toString();
        return freightId && !existingIds.has(freightId);
      });

      this.logger.log(`📤 ${freightsToCreate.length} fretes novos serão enviados para a fila SQS`);

      // 5. Enviar fretes não existentes para a fila SQS
      let sentCount = 0;
      let errorCount = 0;

      for (const freight of freightsToCreate) {
        try {
          await this.sqsService.sendMessage(this.queueUrlFreightCreate, freight);
          sentCount++;
          this.logger.debug(`✅ Frete ${freight.id} enviado para SQS`);
        } catch (error) {
          errorCount++;
          this.logger.error(
            `❌ Erro ao enviar frete ${freight.id} para SQS:`,
            error.message || error,
          );
        }
      }

      this.logger.log(
        `🎉 Sincronização concluída! ` +
        `Total: ${freightsFromFretebras.length} | ` +
        `Já existentes: ${existingIds.size} | ` +
        `Enviados: ${sentCount} | ` +
        `Erros: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error('❌ Erro durante sincronização de fretes:', error.message || error);
    }
  }

  /**
   * Método para sincronizar manualmente (útil para testes)
   */
  async syncManually() {
    this.logger.log('🔧 Sincronização manual solicitada');
    return this.syncFreightsFromToday();
  }

  async onModuleDestroy() {
    try {
      if (this.fretebrasClient) {
        await this.fretebrasClient.end();
        this.logger.log('🔌 Conexão com Fretebras encerrada');
      }
    } catch (error) {
      this.logger.error('❌ Erro ao encerrar conexão Fretebras:', error.message || error);
    }
  }
}
