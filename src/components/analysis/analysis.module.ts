import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { Freight } from '@entities/freight.entity';
import { FreightRequest } from '@entities/freight-requests.entity';
import { FreightRoutes } from '@entities/freight-routes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Freight, FreightRequest, FreightRoutes])],
  providers: [AnalysisService],
  controllers: [AnalysisController],
  exports: [AnalysisService],
})
export class AnalysisModule {}
