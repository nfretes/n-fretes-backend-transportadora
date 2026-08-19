import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/entities/company.entity';
import { CompanySearchService } from './company-search.service';
import { CompanySearchController } from './company-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [CompanySearchService],
  controllers: [CompanySearchController],
  exports: [CompanySearchService],
})
export class CompanySearchModule {}
