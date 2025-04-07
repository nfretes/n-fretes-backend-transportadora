import { PlansCompany } from '@entities/plans-company.entity';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import {
  PaymentMethod,
  Transactions,
  TransactionType,
} from '@entities/transactions.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsaasWebhookEvent, Payment } from './types';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);

  constructor(
    @InjectRepository(SubscriptionCompany)
    private subscriptionRepository: Repository<SubscriptionCompany>,
    @InjectRepository(Transactions)
    private transactionRepository: Repository<Transactions>,
    @InjectRepository(PlansCompany)
    private planRepository: Repository<PlansCompany>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async processWebhookEvent(webhook: AsaasWebhookEvent) {
    this.logger.log(`Processando webhook: ${JSON.stringify(webhook)}`);

    try {
      switch (webhook.event) {
        case 'PAYMENT_RECEIVED':
          return await this.handlePaymentReceived(webhook.payment);
        case 'PAYMENT_OVERDUE':
          return await this.handlePaymentOverdue(webhook.payment);

        default:
          this.logger.warn(`Evento desconhecido: ${webhook.event}`);
          throw new HttpException(
            `Evento não implementado: ${webhook.event}`,
            HttpStatus.NOT_IMPLEMENTED,
          );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao processar webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private getAsaasConfig() {
    return {
      baseUrl: this.configService.get<string>('ASAAS_BASE_URL'),
      apiToken: this.configService.get<string>('ASAAS_API_KEY'),
    };
  }

  private getAuthHeaders() {
    const { apiToken } = this.getAsaasConfig();
    return {
      'Content-Type': 'application/json',
      access_token: apiToken,
    };
  }

  private async handlePaymentReceived(payment: Payment) {
    const queryRunner =
      this.subscriptionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!payment.subscription) {
        this.logger.log(`Pagamento avulso recebido: ${payment.id}`);
        return { success: true, message: 'Pagamento avulso processado' };
      }

      const subscriptionId = payment.subscription;
      this.logger.log(
        `Processando pagamento para assinatura: ${subscriptionId}`,
      );

      const subscription = await queryRunner.manager.findOne(
        SubscriptionCompany,
        {
          where: { merchantOrderId: subscriptionId },
        },
      );

      if (!subscription) {
        this.logger.error(`Assinatura não encontrada: ${subscriptionId}`);
        throw new HttpException(
          'Assinatura não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      const plan = await queryRunner.manager.findOne(PlansCompany, {
        where: { id: subscription.planId },
      });

      if (!plan) {
        this.logger.error(
          `Plano não encontrado para assinatura: ${subscriptionId}`,
        );
        throw new HttpException('Plano não encontrado', HttpStatus.NOT_FOUND);
      }

      const newInterval = subscription.interval + 1;
      const now = new Date();
      const nextRecurrency = new Date(now);
      nextRecurrency.setMonth(nextRecurrency.getMonth() + 1);
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      //@ts-ignore
      subscription.endDate = endDate;
      //@ts-ignore
      subscription.nextRecurrency = nextRecurrency;
      subscription.interval = newInterval;

      await queryRunner.manager.save(subscription);

      const transaction = queryRunner.manager.create(Transactions, {
        amount: payment.value,
        reason: `Renovação do plano ${plan.name}`,
        companyId: subscription.companyId,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionType: TransactionType.COMPANY,
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(
        `💳 Assinatura renovada com sucesso - ID: ${subscriptionId}`,
      );
      this.logger.log(`🔄 Intervalo: ${newInterval}ª renovação`);
      this.logger.log(`💰 Valor pago: R$ ${payment.value}`);
      this.logger.log(`📅 Próxima renovação: ${subscription.nextRecurrency}`);

      return {
        success: true,
        subscriptionId: subscription.id,
        paymentId: payment.id,
        interval: newInterval,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Falha ao processar pagamento: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Erro ao processar pagamento: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async handlePaymentOverdue(payment: Payment) {
    const queryRunner =
      this.subscriptionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.warn(`⌛ Pagamento atrasado detectado: ${payment.id}`);
      const { baseUrl } = this.getAsaasConfig();

      if (!payment.subscription) {
        this.logger.log(
          'Pagamento atrasado não está associado a uma assinatura',
        );
        return { success: true };
      }
      const subscription = await queryRunner.manager.findOne(
        SubscriptionCompany,
        {
          where: { merchantOrderId: payment.subscription },
        },
      );

      if (!subscription) {
        throw new HttpException(
          'Assinatura não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      subscription.status = 2;
      //@ts-ignore
      subscription.endDate = new Date().toISOString();

      const response = await firstValueFrom(
        this.httpService.put(
          `${baseUrl}/subscriptions/${subscription.merchantOrderId}`,
          { status: 'INACTIVE' },
          { headers: this.getAuthHeaders() },
        ),
      );

      await queryRunner.manager.save(SubscriptionCompany, subscription);
      await queryRunner.commitTransaction();

      this.logger.log(
        `✅ Assinatura ${subscription.merchantOrderId} desativada por atraso`,
      );
      return {
        success: true,
        subscriptionId: subscription.id,
        asaasResponse: response.data,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Erro ao processar pagamento atrasado: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `Falha ao processar pagamento atrasado: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
