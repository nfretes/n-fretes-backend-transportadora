import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { Transactions } from '@entities/transactions.entity';
import { WebhookAssasController } from './webhook.assas.controller';
import { AsaasService } from './webhook.assas.service';
import { PlansCompany } from '@entities/plans-company.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FeatureUsage } from '@entities/feature-usage.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([SubscriptionCompany, Transactions, PlansCompany, FeatureUsage]),
  ],
  controllers: [WebhookAssasController],
  providers: [AsaasService],
})
export class WebhookAsaasModule {}
