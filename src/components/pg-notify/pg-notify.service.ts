import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { SQSService } from '../sqs/sqs.service';

@Injectable()
export class PgNotifyService implements OnModuleInit {
  private client: Client;
  private readonly queueUrlFreightCreate: string;

  constructor(
    private configService: ConfigService,
    private sqsService: SQSService,
  ) {
    this.queueUrlFreightCreate = this.configService.get('QUEUE_FREIGHT_CREATE');
    console.log('[PG-NOTIFY] URL da fila SQS:', this.queueUrlFreightCreate);
  }

  async onModuleInit() {
    await this.connectAndListen();
  }

  private async connectAndListen() {
    try {
      if (this.client) {
        try {
          await this.client.end();
        } catch (err) {
          // Ignorar erro
        }
      }

      this.client = new Client({
        host: this.configService.get('DATABASE_HOST_FRETEBRAS'),
        port: this.configService.get('DATABASE_PORT_FRETEBRAS') || 15432,
        database: this.configService.get('DATABASE_NAME_FRETEBRAS'),
        user: this.configService.get('DATABASE_USERNAME_FRETEBRAS'),
        password: this.configService.get('DATABASE_PASSWORD_FRETEBRAS'),
        connectionTimeoutMillis: 10000,
        query_timeout: 30000,
        keepAlive: true,
      });

      this.client.on('error', (error) => {
        console.error('[PG-NOTIFY] ❌ Erro na conexão:', error.message);
        this.reconnect();
      });

      this.client.on('end', () => {
        console.warn('[PG-NOTIFY] ⚠️ Conexão encerrada, reconectando...');
        this.reconnect();
      });

      await this.client.connect();
      console.log('[PG-NOTIFY] ✅ Conectado ao PostgreSQL Fretebras');
      
      await this.client.query('LISTEN novo_frete');
      console.log('[PG-NOTIFY] 👂 Escutando canal "novo_frete"');

      this.client.on('notification', async (msg) => {
        if (msg.channel === 'novo_frete') {
          try {
            console.log('[PG-NOTIFY] 📨 Notificação recebida:', msg.payload);
            const freightData = JSON.parse(msg.payload);
            await this.sqsService.sendMessage(this.queueUrlFreightCreate, freightData);
            console.log('[PG-NOTIFY] ✅ Frete enviado para SQS com sucesso');
          } catch (error) {
            console.error('[PG-NOTIFY] ❌ Erro ao processar notificação:', error);
          }
        }
      });
    } catch (error) {
      console.error('[PG-NOTIFY] ❌ Falha ao conectar ao PostgreSQL:', error.message);
      this.reconnect();
    }
  }

  private reconnect() {
    console.log('[PG-NOTIFY] 🔄 Reconectando em 5 segundos...');
    setTimeout(() => {
      this.connectAndListen();
    }, 5000);
  }

  async reprocessFreightsFromDate(fromDate: string): Promise<{ processed: number }> {
    if (!this.client) {
      throw new Error('Conexão com PostgreSQL Fretebras ainda não inicializada');
    }

    console.log(`[PG-NOTIFY] Reprocessando fretes a partir de ${fromDate}`);

    try {
      const query = `
        SELECT *
        FROM public.fretes
        WHERE created_at >= $1::timestamp
          AND status = 'AVAILABLE'
        ORDER BY created_at ASC
      `;

      const result = await this.client.query(query, [fromDate]);
      const rows = result.rows || [];

      console.log(`[PG-NOTIFY] ${rows.length} fretes encontrados para reprocessar`);

      let processed = 0;

      for (const row of rows) {
        try {
          await this.sqsService.sendMessage(this.queueUrlFreightCreate, row);
          processed++;
        } catch (err) {
          console.error('[PG-NOTIFY] Erro ao enviar frete para SQS durante reprocessamento:', err);
        }
      }

      console.log(`[PG-NOTIFY] Reprocessamento concluído. Fretes enviados: ${processed}`);

      return { processed };
    } catch (error) {
      console.error('[PG-NOTIFY] Erro ao reprocessar fretes por data:', error);
      throw error;
    }
  }
}
