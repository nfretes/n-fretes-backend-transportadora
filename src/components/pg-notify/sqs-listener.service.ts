import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { Client } from 'pg';
import { Company } from '../../entities/company.entity';
import { ContactCompany } from '../../entities/contact-company.entity';
import { Freight } from '../../entities/freight.entity';
import { VehicleType, BodyType } from '../../enum/vehicle';
import { PaymentMethod, UnityMetric, SpecieOfLoad, Toll } from '../../enum/freight';
import { FretebrasService } from '../fretebras/fretebras.service';
import {
  NFRETES_GROUP_ID_NORTE,
  NFRETES_GROUP_ID_CENTRO_OESTE,
  NFRETES_GROUP_ID_NORDESTE,
  NFRETES_GROUP_ID_SUDESTE,
  NFRETES_GROUP_ID_SUL,
} from '../fretebras/group';

@Injectable()
export class SqsListenerService implements OnModuleInit, OnModuleDestroy {
  private sqsClient: SQSClient;
  private readonly queueUrl: string;
  private isRunning: boolean = false;
  private fretebrasClient: Client;
  private isConnecting = false;
  private readonly dbConfig: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    private fretebrasService: FretebrasService,
  ) {
    this.queueUrl = this.configService.get('QUEUE_FREIGHT_CREATE');
    this.sqsClient = new SQSClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

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
  }

  async onModuleInit() {
    this.isRunning = true;
    console.log('[SQS-LISTENER] Iniciando escuta da fila:', this.queueUrl);
    await this.connectToFretebras();
    this.pollQueue();
  }

  private async connectToFretebras() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      if (this.fretebrasClient) {
        try {
          await this.fretebrasClient.end();
        } catch (err) {
          // Ignorar erro
        }
      }

      this.fretebrasClient = new Client(this.dbConfig);

      this.fretebrasClient.on('error', (err) => {
        console.error('[SQS-LISTENER] ❌ Erro na conexão Fretebras:', err.message);
        this.reconnectToFretebras();
      });

      this.fretebrasClient.on('end', () => {
        console.warn('[SQS-LISTENER] ⚠️ Conexão Fretebras encerrada, reconectando...');
        this.reconnectToFretebras();
      });

      await this.fretebrasClient.connect();
      console.log('[SQS-LISTENER] ✅ Conectado ao PostgreSQL Fretebras (consulta)');
    } catch (err) {
      console.error('[SQS-LISTENER] ❌ Falha ao conectar ao PostgreSQL Fretebras:', err.message || err);
      this.reconnectToFretebras();
    } finally {
      this.isConnecting = false;
    }
  }

  private reconnectToFretebras() {
    console.log('[SQS-LISTENER] 🔄 Reconectando ao Fretebras em 5 segundos...');
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
      await this.fretebrasClient.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('[SQS-LISTENER] ❌ Conexão não disponível:', error.message);
      this.reconnectToFretebras();
      return false;
    }
  }

  async onModuleDestroy() {
    this.isRunning = false;
    console.log('[SQS-LISTENER] Parando escuta da fila');
    try {
      if (this.fretebrasClient) await this.fretebrasClient.end();
    } catch (err) {
      console.error('[SQS-LISTENER] Erro ao encerrar conexão Fretebras:', err.message || err);
    }
  }

  private async pollQueue() {
    while (this.isRunning) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 1, // Processar apenas 1 mensagem por vez
          WaitTimeSeconds: 20,
        });

        const response = await this.sqsClient.send(command);

        if (response.Messages && response.Messages.length > 0) {
          for (const message of response.Messages) {
            await this.processMessage(message);
            await this.deleteMessage(message.ReceiptHandle);
          }
        }
      } catch (error) {
        console.error('[SQS-LISTENER] Erro ao escutar fila:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessage(message: any) {
    try {
      const body = JSON.parse(message.Body);
      console.log('[SQS-LISTENER] Mensagem recebida:', body);

      let company = await this.companyRepository.findOne({
        where: { id: body.transportadora_id },
        relations: ['contacts'],
      });

      // If company not found locally, try to fetch from external Fretebras DB
      if (!company) {
        console.log('[SQS-LISTENER] Empresa não encontrada localmente, consultando Fretebras DB...');
        try {
          // Garantir conexão antes de consultar
          const isConnected = await this.ensureConnection();
          if (!isConnected) {
            console.error('[SQS-LISTENER] Conexão Fretebras não disponível, não foi possível buscar empresa');
            return;
          }

          const transportadoraId = body.transportadora_id;
          const res = await this.fretebrasClient.query(
            `SELECT id, slug, external_id, nome, razao_social, ramo, ativa_ha, endereco, bairro_cidade_estado, telefone, telefone_json, celular, celular_json, whatsapp, site, logo_url, url_empresa, grupo_id, dados_completos, created_at, updated_at FROM public.transportadoras WHERE id::text = $1 OR external_id::text = $1 OR slug = $1 LIMIT 1`,
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

            // attempt to parse city/state from bairro_cidade_estado
            if (t.bairro_cidade_estado) {
              const parts = (t.bairro_cidade_estado || '').split(',');
              if (parts.length >= 2) {
                companyData.city = parts[0].trim();
                const statePart = parts[1].split('-')[0].trim();
                companyData.state = statePart;
              }
            }

            company = await this.companyRepository.save(companyData);

            // create contacts from celular_json
            try {
              const celularJson = t.celular_json || t.telefone_json || t.telefone || null;
              let contatos = null;
              if (celularJson) {
                contatos = typeof celularJson === 'string' ? JSON.parse(celularJson) : celularJson;
              }

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
              console.error('[SQS-LISTENER] Erro ao criar contatos a partir de celular_json:', err.message || err);
            }

            console.log('[SQS-LISTENER] Empresa criada a partir do Fretebras DB:', company.id);
          } else {
            console.log('[SQS-LISTENER] Transportadora não encontrada no Fretebras DB');
            return;
          }
        } catch (err) {
          console.error('[SQS-LISTENER] Erro ao consultar Fretebras DB:', err.message || err);
          return;
        }
      }

      let contactCompanyId = null;
      if (body.contatos) {
        try {
          const contatos = typeof body.contatos === 'string' ? JSON.parse(body.contatos) : body.contatos;
          if (contatos.whatsapp && contatos.whatsapp.length > 0) {
            const whatsappData = contatos.whatsapp[0];
            const phoneNumber = Object.keys(whatsappData)[0];
            const contactName = whatsappData[phoneNumber];

            const existingContact = await this.contactCompanyRepository.findOne({
              where: {
                companyId: company.id,
                name: contactName,
              },
            });

            if (existingContact) {
              contactCompanyId = existingContact.id;
            } else {
              const contact = await this.contactCompanyRepository.save({
                name: contactName,
                phoneNumber: phoneNumber,
                companyId: company.id,
              });
              contactCompanyId = contact.id;
            }
          }
        } catch (error) {
          console.error('[SQS-LISTENER] Erro ao processar contatos:', error);
        }
      } else if (company.contacts && company.contacts.length > 0) {
        contactCompanyId = company.contacts[0].id;
      }

      const freight = this.freightRepository.create({
        companyId: company.id,
        contactCompanyId,
        originCity: body.origem_cidade,
        originState: body.origem_estado,
        destinyCity: body.destino_cidade,
        destinyState: body.destino_estado,
        distance: body.distancia,
        product: body.carga,
        tracker: body.has_tracking || false,
        Valuefreight: this.parsePrice(body.preco),
        weightOfLoad: '0',
        calValue: PaymentMethod.TOCOMBINE,
        valueCall: this.mapValueCall(body.tipo_valor),
        unityMetric: UnityMetric.BYTONS,
        specieOfLoad: this.mapSpecieOfLoad(body.especie),
        Toll: body.pedagio_incluido ? Toll.INCLUEDVALUE : Toll.PAYMENTPARTY,
        vehicleTypes: this.mapVehicleTypes(body.tipos_veiculo),
        bodyTypes: this.mapBodyTypes(body.carrocerias),
      });

      await this.freightRepository.save(freight);
      console.log('[SQS-LISTENER] ✅ Frete inserido com sucesso! ID:', freight.id);

      // Enviar mensagem no WhatsApp após cadastrar o frete
      await this.sendFreightNotificationToWhatsApp(body);
    } catch (error) {
      console.error('[SQS-LISTENER] Erro ao processar mensagem:', error);
    }
  }

  private getGroupIdByRegion(region: string): string | null {
    const groupMap = {
      NORTE: NFRETES_GROUP_ID_NORTE,
      CENTRO_OESTE: NFRETES_GROUP_ID_CENTRO_OESTE,
      NORDESTE: NFRETES_GROUP_ID_NORDESTE,
      SUDESTE: NFRETES_GROUP_ID_SUDESTE,
      SUL: NFRETES_GROUP_ID_SUL,
    };
    return groupMap[region] || null;
  }

  private formatFreightMessage(freightData: any): string {
    const origem = freightData.origem_cidade && freightData.origem_estado
      ? `${freightData.origem_cidade} - ${freightData.origem_estado}`
      : freightData.origem || 'Origem não informada';
    
    const destino = freightData.destino_cidade && freightData.destino_estado
      ? `${freightData.destino_cidade} - ${freightData.destino_estado}`
      : freightData.destino || 'Destino não informado';
    
    const tipoCarga = freightData.carga || 'Carga não informada';
    const veiculo = freightData.tipos_veiculo || 'Veículo não informado';
    const link = 'https://motorista-convite.nfretes.com.br';

    return `🚛 *Novo Frete Disponível!*\n\n` +
           `📍 *Origem:* ${origem}\n` +
           `📍 *Destino:* ${destino}\n` +
           `📦 *Carga:* ${tipoCarga}\n` +
           `🚚 *Veículo:* ${veiculo}\n\n` +
           `Para baixar o app e aceitar este frete, clique no link abaixo:\n` +
           `${link}\n\n` +
           `_O frete está disponível! Baixe o app, procure pela origem e envie seu convite._`;
  }

  private async sendFreightNotificationToWhatsApp(freightData: any): Promise<void> {
    try {
      // Determina a região do frete
      const region = this.fretebrasService.getRegionFromFreight(freightData);
      
      if (!region) {
        console.warn('[SQS-LISTENER] Não foi possível determinar região do frete');
        return;
      }

      // Busca o ID do grupo correspondente
      const groupId = this.getGroupIdByRegion(region);
      
      if (!groupId) {
        console.warn('[SQS-LISTENER] Grupo não encontrado para região:', region);
        return;
      }

      // Formata a mensagem
      const message = this.formatFreightMessage(freightData);

      // Envia a mensagem
      console.log(`[SQS-LISTENER] Enviando notificação para grupo da região ${region}`);
      await this.fretebrasService.sendTextMessage(groupId, message);
      console.log(`[SQS-LISTENER] ✅ Notificação enviada com sucesso para região ${region}`);
    } catch (error) {
      console.error('[SQS-LISTENER] Erro ao enviar notificação no WhatsApp:', error);
      // Não lança o erro para não interromper o fluxo principal
    }
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
    if (tipoValor.toLowerCase().includes('kg') || tipoValor.toLowerCase().includes('quilo')) {
      return 'Por quilos';
    }
    return 'Por toneladas';
  }

  private mapSpecieOfLoad(especie: string): SpecieOfLoad {
    if (!especie) return SpecieOfLoad.OTHERS;

    const especieLower = especie.toLowerCase();
    const map: Record<string, SpecieOfLoad> = {
      'animais': SpecieOfLoad.ANIMAL,
      'big bag': SpecieOfLoad.BIGBAG,
      'bobina': SpecieOfLoad.COIL,
      'caixas': SpecieOfLoad.BOX,
      'container': SpecieOfLoad.CONTAINER,
      'fardos': SpecieOfLoad.BALES,
      'fracionada': SpecieOfLoad.FRACTIONAL,
      'granel': SpecieOfLoad.BULK,
      'metro': SpecieOfLoad.METRIC_CUBIC,
      'milheiro': SpecieOfLoad.MILHEIRO,
      'mudanças': SpecieOfLoad.CHANGES,
      'palhetes': SpecieOfLoad.PALLETS,
      'paletes': SpecieOfLoad.PALLETS,
      'passageiros': SpecieOfLoad.PASSENGER,
      'sacos': SpecieOfLoad.BAGS,
      'tambor': SpecieOfLoad.DRUM,
      'unidades': SpecieOfLoad.UNITYS,
    };

    for (const [key, value] of Object.entries(map)) {
      if (especieLower.includes(key)) {
        return value;
      }
    }

    return SpecieOfLoad.OTHERS;
  }

  private mapVehicleTypes(tipos: string): VehicleType[] {
    if (!tipos) return [VehicleType.TRUCK];

    const tiposArray = tipos.replace(/"/g, '').split(',').map(t => t.trim().toLowerCase());
    const result: VehicleType[] = [];

    const map: Record<string, VehicleType> = {
      '3/4': VehicleType.THREE_FOUR,
      'three quarter': VehicleType.THREE_QUARTER,
      'fiorino': VehicleType.FIORINO,
      'toco': VehicleType.TOCO,
      'vcl': VehicleType.VCL,
      'bitruck': VehicleType.BIT_TRUCK,
      'bit truck': VehicleType.BIT_TRUCK,
      'truck': VehicleType.TRUCK,
      'bitrem': VehicleType.BI_TRAIN,
      'bi train': VehicleType.BI_TRAIN,
      'carreta ls': VehicleType.CART_LS,
      'carreta': VehicleType.CART,
      'cart ls': VehicleType.CART_LS,
      'cart': VehicleType.CART,
      'rodotrem': VehicleType.ROAD_TRAIN,
      'road train': VehicleType.ROAD_TRAIN,
      'vanderleia': VehicleType.VANDERLEIA,
      'vanderléia': VehicleType.VANDERLEIA,
    };

    tiposArray.forEach(tipo => {
      let found = false;
      for (const [key, value] of Object.entries(map)) {
        if (tipo === key || tipo.includes(key)) {
          if (!result.includes(value)) {
            result.push(value);
          }
          found = true;
          break;
        }
      }
      if (!found) {
        console.log('[SQS-LISTENER] Tipo de veículo não mapeado:', tipo);
      }
    });

    return result.length > 0 ? result : [VehicleType.TRUCK];
  }

  private mapBodyTypes(carrocerias: string): BodyType[] {
    if (!carrocerias) return [BodyType.CHEST];

    const carroceriasArray = carrocerias.replace(/"/g, '').split(',').map(c => c.trim().toLowerCase());
    const result: BodyType[] = [];

    const map: Record<string, BodyType> = {
      'baú refrigerado': BodyType.REFRIGERATED_CHEST,
      'bau refrigerado': BodyType.REFRIGERATED_CHEST,
      'baú frigorífico': BodyType.FRIDGE_CHEST,
      'bau frigorifico': BodyType.FRIDGE_CHEST,
      'baú': BodyType.CHEST,
      'bau': BodyType.CHEST,
      'sider': BodyType.SIDER,
      'caçamba': BodyType.BUCKET,
      'cacamba': BodyType.BUCKET,
      'grade baixa': BodyType.LOW_GRILLE,
      'graneleiro': BodyType.BULK_CARRIER,
      'plataforma': BodyType.PLATFORM,
      'prancha': BodyType.BOARD,
      'cavalo': BodyType.ONLY_HORSE,
      'container': BodyType.CONTAINER,
      'gaiola': BodyType.CAGE,
      'munck': BodyType.MUNK,
      'munk': BodyType.MUNK,
      'silo': BodyType.SILO,
      'tanque': BodyType.TANK,
    };

    carroceriasArray.forEach(carroceria => {
      let found = false;
      for (const [key, value] of Object.entries(map)) {
        if (carroceria === key || carroceria.includes(key)) {
          if (!result.includes(value)) {
            result.push(value);
          }
          found = true;
          break;
        }
      }
      if (!found) {
        console.log('[SQS-LISTENER] Tipo de carroceria não mapeado:', carroceria);
      }
    });

    return result.length > 0 ? result : [BodyType.CHEST];
  }

  private async deleteMessage(receiptHandle: string) {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });
      await this.sqsClient.send(command);
      console.log('[SQS-LISTENER] Mensagem deletada da fila');
    } catch (error) {
      console.error('[SQS-LISTENER] Erro ao deletar mensagem:', error);
    }
  }
}
