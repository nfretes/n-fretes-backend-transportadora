import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionCompanyService } from './subscription-company.service';
import { SubscriptionCompanyController } from './subscription-company.controller';
import { SubscriptionCompany } from '@entities/subscription-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionCompany])],
  exports: [TypeOrmModule],
  controllers: [SubscriptionCompanyController],
  providers: [SubscriptionCompanyService],
})
export class SubscriptionModule {}
