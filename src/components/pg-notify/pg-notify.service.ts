import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { SQSService } from '../sqs/sqs.service';

@Injectable()
export class PgNotifyService implements OnModuleInit, OnModuleDestroy {
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
    try {
      this.client = new Client({
        host: this.configService.get('DATABASE_HOST_FRETEBRAS'),
        port: this.configService.get('DATABASE_PORT_FRETEBRAS') || 15432,
        database: this.configService.get('DATABASE_NAME_FRETEBRAS'),
        user: this.configService.get('DATABASE_USERNAME_FRETEBRAS'),
        password: this.configService.get('DATABASE_PASSWORD_FRETEBRAS'),
      });

      await this.client.connect();
      console.log('[PG-NOTIFY] Conectado ao PostgreSQL Fretebras');
      
      await this.client.query('LISTEN novo_frete');
      console.log('[PG-NOTIFY] Escutando canal "novo_frete"');

      this.client.on('notification', async (msg) => {
        if (msg.channel === 'novo_frete') {
          try {
            console.log('[PG-NOTIFY] Notificação recebida:', msg.payload);
            const freightData = JSON.parse(msg.payload);
            await this.sqsService.sendMessage(this.queueUrlFreightCreate, freightData);
            console.log('[PG-NOTIFY] Frete enviado para SQS com sucesso');
          } catch (error) {
            console.error('[PG-NOTIFY] Erro ao processar notificação:', error);
          }
      console.log('[PG-NOTIFY] Desconectando do PostgreSQL');
        }
      });

      this.client.on('error', (error) => {
        console.error('[PG-NOTIFY] Erro na conexão:', error);
      });

      this.client.on('end', () => {
        console.log('[PG-NOTIFY] Conexão encerrada');
      });
    } catch (error) {
      console.error('[PG-NOTIFY] Falha ao conectar ao PostgreSQL:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.end();
    }
  }
}
