import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContactCompanyService } from './contact-company.service';
import { PaginationService } from '@components/pagination/pagination.service';
import { ContactCompany } from '@entities/contact-company.entity';
import { ContactCompanyController } from './contact-company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContactCompany])],
  exports: [TypeOrmModule],
  controllers: [ContactCompanyController],
  providers: [ContactCompanyService, PaginationService],
})
export class ContactCompanyModule {}
