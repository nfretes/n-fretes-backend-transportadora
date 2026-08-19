import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreightRouteLocations } from '../../entities/freight-route-locations.entity';
import { CreateRouteLocationDto } from './dto/create-route-location.dto';

@Injectable()
export class FreightRouteLocationsService {
  constructor(
    @InjectRepository(FreightRouteLocations)
    private readonly routeLocationsRepository: Repository<FreightRouteLocations>,
  ) {}

  async create(
    createLocationDto: CreateRouteLocationDto,
  ): Promise<FreightRouteLocations> {
    const location = this.routeLocationsRepository.create(createLocationDto);
    return await this.routeLocationsRepository.save(location);
  }

  async findByRouteId(routeId: string): Promise<FreightRouteLocations[]> {
    return await this.routeLocationsRepository.find({
      where: { routeId },
      order: { timestamp: 'DESC' },
    });
  }

  async getLatestLocation(routeId: string): Promise<FreightRouteLocations> {
    return await this.routeLocationsRepository.findOne({
      where: { routeId },
      order: { timestamp: 'DESC' },
    });
  }
}
