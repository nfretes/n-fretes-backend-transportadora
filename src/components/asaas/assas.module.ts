import { Module } from '@nestjs/common';
import { AsaasController } from './assas.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsaasService } from './assas.service';
import { Company } from '@entities/company.entity';
import { PlansCompany } from '@entities/plans-company.entity';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { Transactions } from '@entities/transactions.entity';
import { CreditCard } from '@entities/credit-card.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Company, PlansCompany, SubscriptionCompany, Transactions, CreditCard]),
  ],
  controllers: [AsaasController],
  providers: [AsaasService],
})
export class AsaasModule {}
