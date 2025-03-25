import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaginationService } from '@components/pagination/pagination.service';
import { Freight } from '@entities/freight.entity';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';
import { Company } from '@entities/company.entity';
import { UsersDrive } from '@entities/users-drive.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Freight, Company, UsersDrive])],
  exports: [TypeOrmModule],
  controllers: [FreightController],
  providers: [FreightService, PaginationService],
})
export class FreightModule {}
