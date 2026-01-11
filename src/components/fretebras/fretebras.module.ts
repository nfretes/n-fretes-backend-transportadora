import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FretebrasService } from './fretebras.service';
import { FretebrasController } from './fretebras.controller';
import { UsersDrive } from '../../entities/users-drive.entity';
import { Company } from '@entities/company.entity';
import { ContactCompany } from '@entities/contact-company.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([UsersDrive, Company, ContactCompany])],
  controllers: [FretebrasController],
  providers: [FretebrasService],
  exports: [FretebrasService],
})
export class FretebrasModule {}
