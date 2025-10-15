import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaginationService } from '@components/pagination/pagination.service';
import { Freight } from '@entities/freight.entity';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';
import { Company } from '@entities/company.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { FeatureUsage } from '@entities/feature-usage.entity';
import { SQSService } from '@components/sqs/sqs.service';
import { FeatureLog } from '@entities/feature-logs.entity';
import { DistanceModule } from '@components/distance/distance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Freight,
      Company,
      UsersDrive,
      SubscriptionCompany,
      FeatureUsage,
      FeatureLog,
    ]),
    DistanceModule,
  ],
  exports: [TypeOrmModule],
  controllers: [FreightController],
  providers: [FreightService, PaginationService, SQSService],
})
export class FreightModule {}
