import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Freight } from '@entities/freight.entity';
import { FreightRequest } from '@entities/freight-requests.entity';
import { FreightRoutes } from '@entities/freight-routes.entity';
import { CompanyOverviewService } from './company-overview.service';
import { CompanyOverviewController } from './company-overview.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Freight, FreightRequest, FreightRoutes]),
  ],
  controllers: [CompanyOverviewController],
  providers: [CompanyOverviewService],
})
export class CompanyOverviewModule {}
