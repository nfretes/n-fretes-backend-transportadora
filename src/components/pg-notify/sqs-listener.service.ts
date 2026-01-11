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

@Injectable()
export class SqsListenerService implements OnModuleInit, OnModuleDestroy {
  private sqsClient: SQSClient;
  private readonly queueUrl: string;
  private isRunning: boolean = false;
  private fretebrasClient: Client;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
  ) {
    this.queueUrl = this.configService.get('QUEUE_FREIGHT_CREATE');
    this.sqsClient = new SQSClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.fretebrasClient = new Client({
      host: this.configService.get('DATABASE_HOST_FRETEBRAS'),
      port: this.configService.get('DATABASE_PORT_FRETEBRAS') || 15432,
      database: this.configService.get('DATABASE_NAME_FRETEBRAS'),
      user: this.configService.get('DATABASE_USERNAME_FRETEBRAS'),
      password: this.configService.get('DATABASE_PASSWORD_FRETEBRAS'),
    });
  }

  async onModuleInit() {
    this.isRunning = true;
    console.log('[SQS-LISTENER] Iniciando escuta da fila:', this.queueUrl);
    try {
      await this.fretebrasClient.connect();
      console.log('[SQS-LISTENER] Conectado ao PostgreSQL Fretebras (consulta)');
    } catch (err) {
      console.error('[SQS-LISTENER] Falha ao conectar ao PostgreSQL Fretebras:', err.message || err);
    }
    this.pollQueue();
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
          MaxNumberOfMessages: 10,
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
    } catch (error) {
      console.error('[SQS-LISTENER] Erro ao processar mensagem:', error);
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
