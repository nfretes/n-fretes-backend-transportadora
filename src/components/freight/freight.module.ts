import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaginationService } from '@components/pagination/pagination.service';
import { Freight } from '@entities/freight.entity';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';
import { Company } from '@entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Freight, Company])],
  exports: [TypeOrmModule],
  controllers: [FreightController],
  providers: [FreightService, PaginationService],
})
export class FreightModule {}
