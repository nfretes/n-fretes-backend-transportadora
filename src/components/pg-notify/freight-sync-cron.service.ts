import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Client } from 'pg';
import { Freight } from '../../entities/freight.entity';
import { Company } from '../../entities/company.entity';
import { ContactCompany } from '../../entities/contact-company.entity';
import { VehicleType, BodyType } from '../../enum/vehicle';
import {
  PaymentMethod,
  UnityMetric,
  SpecieOfLoad,
  Toll,
} from '../../enum/freight';
import { FretebrasService } from '../fretebras/fretebras.service';
import {
  NFRETES_GROUP_ID_NORTE,
  NFRETES_GROUP_ID_CENTRO_OESTE,
  NFRETES_GROUP_ID_NORDESTE,
  NFRETES_GROUP_ID_SUDESTE,
  NFRETES_GROUP_ID_SUL,
} from '../fretebras/group';

@Injectable()
export class FreightSyncCronService {
  private readonly logger = new Logger(FreightSyncCronService.name);
  private fretebrasClient: Client;
  private isConnecting = false;
  private isReconnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly dbConfig: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    private fretebrasService: FretebrasService,
  ) {
    this.dbConfig = {
      host: this.configService.get('DATABASE_HOST_FRETEBRAS'),
      port: this.configService.get('DATABASE_PORT_FRETEBRAS') || 15432,
      database: this.configService.get('DATABASE_NAME_FRETEBRAS'),
      user: this.configService.get('DATABASE_USERNAME_FRETEBRAS'),
      password: this.configService.get('DATABASE_PASSWORD_FRETEBRAS'),
      connectionTimeoutMillis: 30000,
      query_timeout: 60000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

    this.connectToFretebras();
  }

  private async connectToFretebras() {
    if (this.isConnecting) {
      this.logger.debug('⏳ Conexão já em andamento, aguardando...');
      return;
    }

    this.isConnecting = true;

    try {
      if (this.fretebrasClient) {
        try {
          this.fretebrasClient.removeAllListeners();
          await this.fretebrasClient.end();
          this.logger.debug('🔌 Conexão anterior encerrada');
        } catch (err) {}
        this.fretebrasClient = null;
      }
      this.fretebrasClient = new Client(this.dbConfig);

      this.fretebrasClient.on('error', (err) => {
        this.logger.error(`❌ Erro na conexão Fretebras: ${err.message}`);
        if (!this.isReconnecting) {
          this.reconnectToFretebras();
        }
      });

      this.fretebrasClient.on('end', () => {
        this.logger.warn('⚠️ Conexão Fretebras encerrada');
        if (!this.isReconnecting) {
          this.reconnectToFretebras();
        }
      });

      await this.fretebrasClient.connect();
      this.logger.log(
        '✅ Conectado ao banco Fretebras para sincronização CRON',
      );
      this.isReconnecting = false;
    } catch (error) {
      this.logger.error(
        `❌ Falha ao conectar ao banco Fretebras: ${error.message || error}`,
      );
      this.reconnectToFretebras();
    } finally {
      this.isConnecting = false;
    }
  }

  private reconnectToFretebras() {
    if (this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.logger.log('🔄 Reconectando ao Fretebras em 10 segundos...');
    this.reconnectTimeout = setTimeout(() => {
      this.connectToFretebras();
    }, 10000); // Aumentado para 10 segundos
  }

  private async ensureConnection(): Promise<boolean> {
    try {
      if (!this.fretebrasClient) {
        this.logger.warn('⚠️ Cliente não existe, criando nova conexão...');
        await this.connectToFretebras();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Testar conexão com timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao testar conexão')), 5000),
      );

      const queryPromise = this.fretebrasClient.query('SELECT 1');

      await Promise.race([queryPromise, timeoutPromise]);
      return true;
    } catch (error) {
      this.logger.error(`❌ Conexão não disponível: ${error.message}`);
      if (!this.isReconnecting) {
        this.reconnectToFretebras();
      }
      return false;
    }
  }

  /**
   * Cron job que roda a cada 10 minutos
   * Busca fretes novos no banco local que ainda não foram compartilhados
   * e envia notificações agrupadas por região no WhatsApp
   */
  @Cron('*/10 * * * *', {
    name: 'freight-sync',
    timeZone: 'America/Sao_Paulo',
  })
  async syncFreightsFromToday() {
    this.logger.log('🔄 Iniciando sincronização periódica de fretes...');

    try {
      // 1. Buscar fretes do banco local que ainda não foram compartilhados
      // Apenas fretes com isToShare=true, openSolicitations=true e isActive=true
      const freightsToShare = await this.freightRepository.find({
        where: {
          isToShare: true,
          openSolicitations: true,
          isActive: true,
        },
        relations: ['company'],
        order: {
          createdAt: 'DESC',
        },
      });

      this.logger.log(
        `📦 Encontrados ${freightsToShare.length} fretes para compartilhar`,
      );

      if (freightsToShare.length === 0) {
        this.logger.log('✅ Nenhum frete para compartilhar');
        return;
      }

      // 2. AGRUPAR POR REGIÃO (máximo 10 por região)
      const freightsByRegion = this.groupLocalFreightsByRegion(freightsToShare);

      // 3. Enviar notificações agrupadas para cada região
      let sharedCount = 0;
      let errorCount = 0;

      for (const [region, freights] of Object.entries(freightsByRegion)) {
        if (Array.isArray(freights) && freights.length > 0) {
          this.logger.log(
            `📍 Compartilhando ${freights.length} fretes da região ${region}`,
          );

          try {
            await this.sendGroupedNotificationsWithUpdate(freights, region);
            sharedCount += freights.length;

            // 4. Marcar fretes como compartilhados (isToShare = false)
            const freightIds = freights.map((f) => f.id);
            await this.freightRepository.update(
              { id: In(freightIds) },
              { isToShare: false },
            );

            this.logger.log(
              `✅ ${freights.length} fretes compartilhados e marcados (${region})`,
            );
          } catch (error) {
            errorCount += freights.length;
            this.logger.error(
              `❌ Erro ao compartilhar fretes da região ${region}:`,
              error.message || error,
            );
          }
        }
      }

      this.logger.log(
        `🎉 Sincronização concluída! ` +
          `Total encontrados: ${freightsToShare.length} | ` +
          `Compartilhados: ${sharedCount} | ` +
          `Erros: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Erro durante sincronização de fretes:',
        error.message || error,
      );
    }
  }

  private groupLocalFreightsByRegion(freights: Freight[]) {
    const regions = {
      NORTE: [],
      NORDESTE: [],
      CENTRO_OESTE: [],
      SUDESTE: [],
      SUL: [],
    };

    // Mapa de estados para regiões
    const stateToRegion = {
      AC: 'NORTE',
      AP: 'NORTE',
      AM: 'NORTE',
      PA: 'NORTE',
      RO: 'NORTE',
      RR: 'NORTE',
      TO: 'NORTE',
      AL: 'NORDESTE',
      BA: 'NORDESTE',
      CE: 'NORDESTE',
      MA: 'NORDESTE',
      PB: 'NORDESTE',
      PE: 'NORDESTE',
      PI: 'NORDESTE',
      RN: 'NORDESTE',
      SE: 'NORDESTE',
      DF: 'CENTRO_OESTE',
      GO: 'CENTRO_OESTE',
      MT: 'CENTRO_OESTE',
      MS: 'CENTRO_OESTE',
      ES: 'SUDESTE',
      MG: 'SUDESTE',
      RJ: 'SUDESTE',
      SP: 'SUDESTE',
      PR: 'SUL',
      RS: 'SUL',
      SC: 'SUL',
    };

    // Agrupar por região baseado no estado de origem
    for (const freight of freights) {
      const originState = freight.originState?.toUpperCase();
      const region = stateToRegion[originState] || 'SUDESTE'; // Default SUDESTE

      if (regions[region]) {
        regions[region].push(freight);
      }
    }

    // Limitar a 10 fretes por região
    Object.keys(regions).forEach((region) => {
      const total = regions[region].length;
      regions[region] = regions[region].slice(0, 10);
      if (total > 0) {
        this.logger.log(
          `📊 Região ${region}: ${total} fretes, compartilhando ${regions[region].length}`,
        );
      }
    });

    return regions;
  }

  private async sendGroupedNotificationsWithUpdate(
    freights: Freight[],
    region: string,
  ) {
    const regionGroupMap = {
      NORTE: { id: NFRETES_GROUP_ID_NORTE, name: 'Norte' },
      NORDESTE: { id: NFRETES_GROUP_ID_NORDESTE, name: 'Nordeste' },
      CENTRO_OESTE: { id: NFRETES_GROUP_ID_CENTRO_OESTE, name: 'Centro-Oeste' },
      SUDESTE: { id: NFRETES_GROUP_ID_SUDESTE, name: 'Sudeste' },
      SUL: { id: NFRETES_GROUP_ID_SUL, name: 'Sul' },
    };

    const groupInfo = regionGroupMap[region];
    if (!groupInfo || !groupInfo.id) {
      this.logger.warn(`Grupo não configurado para região: ${region}`);
      return;
    }

    try {
      const message = this.formatLocalFreightMessage(freights, groupInfo.name);
      await this.fretebrasService.sendTextMessage(groupInfo.id, message);
      this.logger.log(
        `✅ Enviados ${freights.length} fretes para região ${region}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erro ao enviar mensagem para região ${region}:`,
        error,
      );
      throw error;
    }
  }

  private formatLocalFreightMessage(
    freights: Freight[],
    regionName: string,
  ): string {
    let message = `🚛 *Novos Fretes Disponíveis - Região ${regionName}!*\n\n`;

    freights.forEach((freight, index) => {
      const origem =
        freight.originCity && freight.originState
          ? `${freight.originCity} - ${freight.originState}`
          : 'Origem não informada';

      const destino =
        freight.destinyCity && freight.destinyState
          ? `${freight.destinyCity} - ${freight.destinyState}`
          : 'Destino não informado';

      const tipoCarga = freight.product || 'Carga não informada';
      const veiculo = freight.vehicleTypes?.join(', ') || 'Veículo não informado';

      // Formatar data e hora
      let dataHora = '';
      if (freight.createdAt) {
        const date = new Date(freight.createdAt);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear();
        const hora = date.getHours().toString().padStart(2, '0');
        const minuto = date.getMinutes().toString().padStart(2, '0');
        dataHora = `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
      }

      // Nome da transportadora
      const transportadora =
        freight.company?.name ||
        freight.company?.nameFantasy ||
        'Transportadora';

      // URL do frete
      const freightUrl = `https://nfretes.com.br/detalhes-do-frete/${freight.id}/`;

      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*Frete ${index + 1}* ${dataHora ? `- ${dataHora}` : ''}\n`;
      message += `🏢 *Transportadora:* ${transportadora}\n`;
      message += `📍 *Origem:* ${origem}\n`;
      message += `📍 *Destino:* ${destino}\n`;
      message += `📦 *Carga:* ${tipoCarga}\n`;
      message += `🚚 *Veículo:* ${veiculo}\n`;
      message += `🔗 ${freightUrl}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💡 *Como aceitar estes fretes:*\n`;
    message += `1️⃣ Clique no link acima de cada frete\n`;
    message += `2️⃣ Baixe o app nFretes Motorista\n`;
    message += `3️⃣ Procure pela origem do frete\n`;
    message += `4️⃣ Envie seu convite!\n\n`;
    message += `_Fretes disponíveis! Não perca essa oportunidade! 🚚💨_`;

    return message;
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
      // Limpar timeout de reconexão
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Encerrar conexão com Fretebras (mantido para compatibilidade)
      if (this.fretebrasClient) {
        this.fretebrasClient.removeAllListeners();
        await this.fretebrasClient.end();
        this.logger.log('🔌 Conexão com Fretebras encerrada');
      }
    } catch (error) {
      this.logger.error(
        `❌ Erro ao encerrar conexão Fretebras: ${error.message || error}`,
      );
    }
  }

  // ======================================================================
  // MÉTODOS LEGADOS - Mantidos para compatibilidade futura com FreteBras
  // ======================================================================

  private groupNewFreightsByRegion(freights: any[]) {
    const regions = {
      NORTE: [],
      NORDESTE: [],
      CENTRO_OESTE: [],
      SUDESTE: [],
      SUL: [],
    };

    // Agrupar por região
    for (const freightData of freights) {
      const region = this.fretebrasService.getRegionFromFreight(freightData);
      if (region && regions[region]) {
        regions[region].push(freightData);
      }
    }

    // Limitar a 10 fretes por região
    Object.keys(regions).forEach((region) => {
      const total = regions[region].length;
      regions[region] = regions[region].slice(0, 10);
      if (total > 0) {
        this.logger.log(
          `📊 Região ${region}: ${total} novos, processando ${regions[region].length}`,
        );
      }
    });

    return regions;
  }

  private groupFreightsByRegion(
    freights: Array<{ freight: Freight; data: any }>,
  ) {
    const regions = {
      NORTE: [],
      NORDESTE: [],
      CENTRO_OESTE: [],
      SUDESTE: [],
      SUL: [],
    };

    for (const item of freights) {
      const region = this.fretebrasService.getRegionFromFreight(item.data);
      if (region && regions[region]) {
        regions[region].push(item.data);
      }
    }

    // Limitar a 10 fretes por região
    Object.keys(regions).forEach((region) => {
      regions[region] = regions[region].slice(0, 10);
    });

    return regions;
  }

  private async sendGroupedNotifications(freightsByRegion: any) {
    const regionGroupMap = {
      NORTE: { id: NFRETES_GROUP_ID_NORTE, name: 'Norte' },
      NORDESTE: { id: NFRETES_GROUP_ID_NORDESTE, name: 'Nordeste' },
      CENTRO_OESTE: { id: NFRETES_GROUP_ID_CENTRO_OESTE, name: 'Centro-Oeste' },
      SUDESTE: { id: NFRETES_GROUP_ID_SUDESTE, name: 'Sudeste' },
      SUL: { id: NFRETES_GROUP_ID_SUL, name: 'Sul' },
    };

    for (const [region, freights] of Object.entries(freightsByRegion)) {
      if (Array.isArray(freights) && freights.length > 0) {
        const groupInfo = regionGroupMap[region];
        if (!groupInfo || !groupInfo.id) {
          this.logger.warn(`Grupo não configurado para região: ${region}`);
          continue;
        }

        try {
          const message = this.formatGroupedFreightMessage(
            freights,
            groupInfo.name,
          );
          await this.fretebrasService.sendTextMessage(groupInfo.id, message);
          this.logger.log(
            `✅ Enviados ${freights.length} fretes para região ${region}`,
          );
        } catch (error) {
          this.logger.error(
            `❌ Erro ao enviar mensagem para região ${region}:`,
            error,
          );
        }
      }
    }
  }

  private formatGroupedFreightMessage(
    freights: any[],
    regionName: string,
  ): string {
    const link = 'https://motorista-convite.nfretes.com.br';
    let message = `🚛 *Novos Fretes Disponíveis - Região ${regionName}!*\n\n`;

    freights.forEach((freight, index) => {
      const origem =
        freight.origem_cidade && freight.origem_estado
          ? `${freight.origem_cidade} - ${freight.origem_estado}`
          : freight.origem || 'Origem não informada';

      const destino =
        freight.destino_cidade && freight.destino_estado
          ? `${freight.destino_cidade} - ${freight.destino_estado}`
          : freight.destino || 'Destino não informado';

      const tipoCarga = freight.carga || 'Carga não informada';
      const veiculo = freight.tipos_veiculo || 'Veículo não informado';

      // Formatar data e hora
      let dataHora = '';
      if (freight.created_at) {
        const date = new Date(freight.created_at);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear();
        const hora = date.getHours().toString().padStart(2, '0');
        const minuto = date.getMinutes().toString().padStart(2, '0');
        dataHora = `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
      }

      // Nome da transportadora
      const transportadora =
        freight.transportadora_nome ||
        freight.nome_transportadora ||
        'Transportadora';

      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*Frete ${index + 1}* ${dataHora ? `- ${dataHora}` : ''}\n`;
      message += `🏢 *Transportadora:* ${transportadora}\n`;
      message += `📍 *Origem:* ${origem}\n`;
      message += `📍 *Destino:* ${destino}\n`;
      message += `📦 *Carga:* ${tipoCarga}\n`;
      message += `🚚 *Veículo:* ${veiculo}\n`;
      message += `🔗 ${link}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💡 *Como aceitar estes fretes:*\n`;
    message += `1️⃣ Clique no link acima de cada frete\n`;
    message += `2️⃣ Baixe o app nFretes Motorista\n`;
    message += `3️⃣ Procure pela origem do frete\n`;
    message += `4️⃣ Envie seu convite!\n\n`;
    message += `_Fretes disponíveis! Não perca essa oportunidade! 🚚💨_`;

    return message;
  }

  private async processAndSaveFreight(
    freightData: any,
  ): Promise<Freight | null> {
    try {
      // Buscar ou criar empresa
      let company = await this.companyRepository.findOne({
        where: { id: freightData.transportadora_id },
        relations: ['contacts'],
      });

      if (!company) {
        this.logger.log(
          `Empresa ${freightData.transportadora_id} não encontrada, consultando Fretebras DB...`,
        );
        company = await this.fetchAndCreateCompany(
          freightData.transportadora_id,
        );
        if (!company) return null;
      }

      // Adicionar nome da transportadora ao freightData para usar na mensagem
      freightData.transportadora_nome =
        company.name || company.nameFantasy || 'Transportadora';

      // Buscar ou criar contato
      let contactCompanyId = null;
      if (freightData.contatos) {
        contactCompanyId = await this.processContact(
          freightData.contatos,
          company.id,
        );
      } else if (company.contacts && company.contacts.length > 0) {
        contactCompanyId = company.contacts[0].id;
      }

      // Criar frete
      const freight = this.freightRepository.create({
        companyId: company.id,
        contactCompanyId,
        originCity: freightData.origem_cidade,
        originState: freightData.origem_estado,
        destinyCity: freightData.destino_cidade,
        destinyState: freightData.destino_estado,
        distance: freightData.distancia,
        product: freightData.carga,
        tracker: freightData.has_tracking || false,
        Valuefreight: this.parsePrice(freightData.preco),
        weightOfLoad: '0',
        calValue: PaymentMethod.TOCOMBINE,
        valueCall: this.mapValueCall(freightData.tipo_valor),
        unityMetric: UnityMetric.BYTONS,
        specieOfLoad: this.mapSpecieOfLoad(freightData.especie),
        Toll: freightData.pedagio_incluido
          ? Toll.INCLUEDVALUE
          : Toll.PAYMENTPARTY,
        vehicleTypes: this.mapVehicleTypes(freightData.tipos_veiculo),
        bodyTypes: this.mapBodyTypes(freightData.carrocerias),
      });

      return await this.freightRepository.save(freight);
    } catch (error) {
      this.logger.error('Erro ao processar e salvar frete:', error);
      return null;
    }
  }

  private async fetchAndCreateCompany(
    transportadoraId: string,
  ): Promise<Company | null> {
    try {
      const res = await this.fretebrasClient.query(
        `SELECT id, slug, external_id, nome, razao_social, ramo, ativa_ha, endereco, bairro_cidade_estado, 
         telefone, telefone_json, celular, celular_json, whatsapp, site, logo_url, url_empresa, grupo_id, 
         dados_completos, created_at, updated_at 
         FROM public.transportadoras 
         WHERE id::text = $1 OR external_id::text = $1 OR slug = $1 LIMIT 1`,
        [transportadoraId],
      );

      if (res.rows && res.rows.length > 0) {
        const t = res.rows[0];
        const companyData: any = {
          id: t.id,
          name: t.nome || t.razao_social || null,
          nameFantasy: t.razao_social || t.nome || null,
          phoneNumber: null,
          phoneNumberJson: t.celular_json || t.telefone_json || null,
          transportCategory: 'Transportadora',
          isActive: true,
          photoUrl: t.logo_url || null,
          city: null,
          state: null,
        };

        if (t.bairro_cidade_estado) {
          const parts = (t.bairro_cidade_estado || '').split(',');
          if (parts.length >= 2) {
            companyData.city = parts[0].trim();
            const statePart = parts[1].split('-')[0].trim();
            companyData.state = statePart;
          }
        }

        const company = await this.companyRepository.save(companyData);

        // Criar contatos
        const celularJson =
          t.celular_json || t.telefone_json || t.telefone || null;
        if (celularJson) {
          try {
            const contatos =
              typeof celularJson === 'string'
                ? JSON.parse(celularJson)
                : celularJson;
            if (Array.isArray(contatos)) {
              for (const c of contatos) {
                const phone = Object.keys(c)[0];
                const name = c[phone] || null;
                const exists = await this.contactCompanyRepository.findOne({
                  where: { companyId: company.id, phoneNumber: phone },
                });
                if (!exists) {
                  await this.contactCompanyRepository.save({
                    name,
                    phoneNumber: phone,
                    companyId: company.id,
                  });
                }
              }
            }
          } catch (err) {
            this.logger.error('Erro ao criar contatos:', err.message);
          }
        }

        return company;
      }
      return null;
    } catch (error) {
      this.logger.error('Erro ao buscar empresa no Fretebras:', error);
      return null;
    }
  }

  private async processContact(
    contatosData: any,
    companyId: string,
  ): Promise<string | null> {
    try {
      const contatos =
        typeof contatosData === 'string'
          ? JSON.parse(contatosData)
          : contatosData;
      if (contatos.whatsapp && contatos.whatsapp.length > 0) {
        const whatsappData = contatos.whatsapp[0];
        const phoneNumber = Object.keys(whatsappData)[0];
        const contactName = whatsappData[phoneNumber];

        const existingContact = await this.contactCompanyRepository.findOne({
          where: { companyId, name: contactName },
        });

        if (existingContact) {
          return existingContact.id;
        }

        const contact = await this.contactCompanyRepository.save({
          name: contactName,
          phoneNumber: phoneNumber,
          companyId: companyId,
        });
        return contact.id;
      }
    } catch (error) {
      this.logger.error('Erro ao processar contatos:', error);
    }
    return null;
  }

  private parsePrice(price: any): number {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const normalizedPrice = price.replace(/\./g, '').replace(',', '.');
      const parsedPrice = parseFloat(normalizedPrice);
      return isNaN(parsedPrice) ? 0 : parsedPrice;
    }
    return 0;
  }

  private mapValueCall(tipoValor: string): string {
    if (!tipoValor || tipoValor.toLowerCase().includes('combinar')) {
      return 'Por toneladas';
    }
    if (tipoValor.toLowerCase().includes('tonelada')) {
      return 'Por toneladas';
    }
    if (
      tipoValor.toLowerCase().includes('kg') ||
      tipoValor.toLowerCase().includes('quilo')
    ) {
      return 'Por quilos';
    }
    return 'Por toneladas';
  }

  private mapSpecieOfLoad(especie: string): SpecieOfLoad {
    if (!especie) return SpecieOfLoad.OTHERS;
    const especieLower = especie.toLowerCase();
    const map: Record<string, SpecieOfLoad> = {
      animais: SpecieOfLoad.ANIMAL,
      'big bag': SpecieOfLoad.BIGBAG,
      bobina: SpecieOfLoad.COIL,
      caixas: SpecieOfLoad.BOX,
      container: SpecieOfLoad.CONTAINER,
      fardos: SpecieOfLoad.BALES,
      fracionada: SpecieOfLoad.FRACTIONAL,
      granel: SpecieOfLoad.BULK,
      metro: SpecieOfLoad.METRIC_CUBIC,
      milheiro: SpecieOfLoad.MILHEIRO,
      mudanças: SpecieOfLoad.CHANGES,
      palhetes: SpecieOfLoad.PALLETS,
      paletes: SpecieOfLoad.PALLETS,
      passageiros: SpecieOfLoad.PASSENGER,
      sacos: SpecieOfLoad.BAGS,
      tambor: SpecieOfLoad.DRUM,
      unidades: SpecieOfLoad.UNITYS,
    };
    for (const [key, value] of Object.entries(map)) {
      if (especieLower.includes(key)) return value;
    }
    return SpecieOfLoad.OTHERS;
  }

  private mapVehicleTypes(tipos: string): VehicleType[] {
    if (!tipos) return [VehicleType.TRUCK];
    const tiposArray = tipos
      .replace(/"/g, '')
      .split(',')
      .map((t) => t.trim().toLowerCase());
    const result: VehicleType[] = [];
    const map: Record<string, VehicleType> = {
      '3/4': VehicleType.THREE_FOUR,
      'three quarter': VehicleType.THREE_QUARTER,
      fiorino: VehicleType.FIORINO,
      toco: VehicleType.TOCO,
      vcl: VehicleType.VCL,
      bitruck: VehicleType.BIT_TRUCK,
      'bit truck': VehicleType.BIT_TRUCK,
      truck: VehicleType.TRUCK,
      bitrem: VehicleType.BI_TRAIN,
      'bi train': VehicleType.BI_TRAIN,
      'carreta ls': VehicleType.CART_LS,
      carreta: VehicleType.CART,
      'cart ls': VehicleType.CART_LS,
      cart: VehicleType.CART,
      rodotrem: VehicleType.ROAD_TRAIN,
      'road train': VehicleType.ROAD_TRAIN,
      vanderleia: VehicleType.VANDERLEIA,
      vanderléia: VehicleType.VANDERLEIA,
    };
    tiposArray.forEach((tipo) => {
      for (const [key, value] of Object.entries(map)) {
        if (tipo === key || tipo.includes(key)) {
          if (!result.includes(value)) {
            result.push(value);
          }
          break;
        }
      }
    });
    return result.length > 0 ? result : [VehicleType.TRUCK];
  }

  private mapBodyTypes(carrocerias: string): BodyType[] {
    if (!carrocerias) return [BodyType.CHEST];
    const carroceriasArray = carrocerias
      .replace(/"/g, '')
      .split(',')
      .map((c) => c.trim().toLowerCase());
    const result: BodyType[] = [];
    const map: Record<string, BodyType> = {
      'baú refrigerado': BodyType.REFRIGERATED_CHEST,
      'bau refrigerado': BodyType.REFRIGERATED_CHEST,
      'baú frigorífico': BodyType.FRIDGE_CHEST,
      'bau frigorifico': BodyType.FRIDGE_CHEST,
      baú: BodyType.CHEST,
      bau: BodyType.CHEST,
      sider: BodyType.SIDER,
      caçamba: BodyType.BUCKET,
      cacamba: BodyType.BUCKET,
      'grade baixa': BodyType.LOW_GRILLE,
      graneleiro: BodyType.BULK_CARRIER,
      plataforma: BodyType.PLATFORM,
      prancha: BodyType.BOARD,
      cavalo: BodyType.ONLY_HORSE,
      container: BodyType.CONTAINER,
      gaiola: BodyType.CAGE,
      munck: BodyType.MUNK,
      munk: BodyType.MUNK,
      silo: BodyType.SILO,
      tanque: BodyType.TANK,
    };
    carroceriasArray.forEach((carroceria) => {
      for (const [key, value] of Object.entries(map)) {
        if (carroceria === key || carroceria.includes(key)) {
          if (!result.includes(value)) {
            result.push(value);
          }
          break;
        }
      }
    });
    return result.length > 0 ? result : [BodyType.CHEST];
  }
}
