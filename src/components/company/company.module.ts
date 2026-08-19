import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from '@entities/company.entity';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { AwsService } from '@components/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, SubscriptionCompany])],
  exports: [TypeOrmModule],
  controllers: [CompanyController],
  providers: [AwsService, ConfigService, CompanyService],
})
export class CompanyModule {}
