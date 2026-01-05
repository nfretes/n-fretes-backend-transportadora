import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PgNotifyService } from './pg-notify.service';
import { SqsListenerService } from './sqs-listener.service';
import { SqsModule } from '../sqs/sqs.module';
import { Company } from '../../entities/company.entity';
import { ContactCompany } from '../../entities/contact-company.entity';
import { Freight } from '../../entities/freight.entity';

@Module({
  imports: [
    SqsModule,
    TypeOrmModule.forFeature([Company, ContactCompany, Freight]),
  ],
  providers: [PgNotifyService, SqsListenerService],
})
export class PgNotifyModule {}
