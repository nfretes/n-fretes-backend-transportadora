import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreightQuote } from '@entities/freight-quote.entity';
import { SapiensService } from './sapiens.service';
import { SapiensController } from './sapiens.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FreightQuote])],
  providers: [SapiensService],
  controllers: [SapiensController],
  exports: [SapiensService],
})
export class SapiensModule {}
