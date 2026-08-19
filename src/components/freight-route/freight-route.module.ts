import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreightRoutes } from '@entities/freight-routes.entity';
import { FreightRouteService } from './freight-route.service';
import { FreightRouteController } from './freight-route.controller';
import { UsersDrive } from '@entities/users-drive.entity';
import { Freight } from '@entities/freight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FreightRoutes, UsersDrive, Freight])],
  controllers: [FreightRouteController],
  providers: [FreightRouteService],
})
export class FreightRouteModule {}
