import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
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
  }

  async onModuleInit() {
    this.isRunning = true;
    console.log('[SQS-LISTENER] Iniciando escuta da fila:', this.queueUrl);
    this.pollQueue();
  }

  async onModuleDestroy() {
    this.isRunning = false;
    console.log('[SQS-LISTENER] Parando escuta da fila');
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

      const company = await this.companyRepository.findOne({
        where: { id: body.transportadora_id },
        relations: ['contacts'],
      });

      if (!company) {
        console.log('[SQS-LISTENER] Empresa não encontrada, ignorando mensagem');
        return;
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
        Valuefreight: body.preco || 0,
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
