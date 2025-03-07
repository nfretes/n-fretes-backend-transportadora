import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FreightRequest } from '@entities/freight-requests.entity';
import { FreightRequestCronService } from './freight-request-croon';

@Module({
  imports: [TypeOrmModule.forFeature([FreightRequest])],
  providers: [FreightRequestCronService],
})
export class FreightRequestCronModule {}
