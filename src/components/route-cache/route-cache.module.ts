import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteCache } from '@entities/route-cache.entity';
import { RouteCacheService } from './route-cache.service';
import { RouteCacheController } from './route-cache.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RouteCache])],
  controllers: [RouteCacheController],
  providers: [RouteCacheService],
  exports: [RouteCacheService],
})
export class RouteCacheModule {}
