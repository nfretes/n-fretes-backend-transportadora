import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PlateLookupService } from './plate-lookup.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [PlateLookupService],
  exports: [PlateLookupService],
})
export class PlateLookupModule {}
