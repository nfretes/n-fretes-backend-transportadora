import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PgNotifyService } from './pg-notify.service';
import { SqsListenerService } from './sqs-listener.service';
import { SqsModule } from '../sqs/sqs.module';
import { FretebrasModule } from '../fretebras/fretebras.module';
import { Company } from '../../entities/company.entity';
import { ContactCompany } from '../../entities/contact-company.entity';
import { Freight } from '../../entities/freight.entity';
import { PgNotifyController } from './pg-notify.controller';

@Module({
  imports: [
    SqsModule,
    FretebrasModule,
    TypeOrmModule.forFeature([Company, ContactCompany, Freight]),
  ],
  controllers: [PgNotifyController],
  providers: [PgNotifyService, SqsListenerService],
})
export class PgNotifyModule {}
