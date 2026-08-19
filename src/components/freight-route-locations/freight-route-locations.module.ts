import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreightRouteLocations } from '../../entities/freight-route-locations.entity';
import { FreightRouteLocationsService } from './freight-route-locations.service';
import { FreightRouteLocationsController } from './freight-route-locations.controller';
@Module({
  imports: [TypeOrmModule.forFeature([FreightRouteLocations])],
  providers: [FreightRouteLocationsService],
  controllers: [FreightRouteLocationsController],
  exports: [FreightRouteLocationsService],
})
export class FreightRouteLocationsModule {}
