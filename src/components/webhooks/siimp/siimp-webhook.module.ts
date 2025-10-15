import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@entities/company.entity';
import { Freight } from '@entities/freight.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import { SiimpWebhookController } from './siimp-webhook.controller';
import { SiimpWebhookService } from './services/siimp-webhook.service';
import { CityDistanceService } from './services/city-distance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Freight, ContactCompany])],
  controllers: [SiimpWebhookController],
  providers: [SiimpWebhookService, CityDistanceService],
  exports: [SiimpWebhookService],
})
export class SiimpWebhookModule {}
