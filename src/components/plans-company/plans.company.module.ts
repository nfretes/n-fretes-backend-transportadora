import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansCompany } from '@entities/plans-company.entity';
import { PlansCompanyService } from './plans.company.service';
import { PlansCompanyController } from './plans.company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlansCompany])],
  controllers: [PlansCompanyController],
  providers: [PlansCompanyService],
})
export class PlansCompanyModule {}
