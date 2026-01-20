import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PgNotifyService implements OnModuleInit {
  private readonly logger = new Logger(PgNotifyService.name);

  constructor(private configService: ConfigService) {
    this.logger.log('PgNotifyService inicializado (não utilizado no momento)');
  }

  async onModuleInit() {
    this.logger.log('Módulo PgNotify carregado. Usando apenas FreightSyncCronService.');
  }

  // Mantido para compatibilidade, mas não faz nada
  async reprocessFreightsFromDate(fromDate: string): Promise<{ processed: number }> {
    this.logger.warn('Método reprocessFreightsFromDate não está mais em uso. Use FreightSyncCronService.');
    return { processed: 0 };
  }
}
