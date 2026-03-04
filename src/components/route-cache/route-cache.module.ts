import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RouteCache } from '@entities/route-cache.entity';
import { RouteCacheService } from './route-cache.service';
import { RouteCacheController } from './route-cache.controller';
import { QualpService } from './qualp.service';

@Module({
  imports: [TypeOrmModule.forFeature([RouteCache]), HttpModule],
  controllers: [RouteCacheController],
  providers: [RouteCacheService, QualpService],
  exports: [RouteCacheService],
})
export class RouteCacheModule {}
