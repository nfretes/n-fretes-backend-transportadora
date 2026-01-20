import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PgNotifyService } from './pg-notify.service';
import { FreightSyncCronService } from './freight-sync-cron.service';
import { FretebrasModule } from '../fretebras/fretebras.module';
import { Company } from '../../entities/company.entity';
import { ContactCompany } from '../../entities/contact-company.entity';
import { Freight } from '../../entities/freight.entity';
import { PgNotifyController } from './pg-notify.controller';

@Module({
  imports: [
    FretebrasModule,
    TypeOrmModule.forFeature([Company, ContactCompany, Freight]),
  ],
  controllers: [PgNotifyController],
  providers: [PgNotifyService, FreightSyncCronService],
  exports: [FreightSyncCronService],
})
export class PgNotifyModule {}
