import { Module } from '@nestjs/common';
import { FreightRequestService } from './freight-request.service';
import { FreightRequestController } from './freight-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreightRequest } from '@entities/freight-requests.entity';
import { PaginationService } from '@components/pagination/pagination.service';
import { FreightRoutes } from '@entities/freight-routes.entity';
import { Freight } from '@entities/freight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FreightRequest, FreightRoutes, Freight])],
  controllers: [FreightRequestController],
  providers: [FreightRequestService, PaginationService],
})
export class FreightRequestModule {}
