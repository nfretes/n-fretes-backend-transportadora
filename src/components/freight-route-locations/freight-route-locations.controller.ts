import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { FreightRouteLocationsService } from './freight-route-locations.service';
import { CreateRouteLocationDto } from './dto/create-route-location.dto';
import { FreightRouteLocations } from '../../entities/freight-route-locations.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('freight-route-locations')
@Controller('freight-route-locations')
@UseGuards(JwtAuthGuard)
export class FreightRouteLocationsController {
  constructor(
    private readonly routeLocationsService: FreightRouteLocationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new route location' })
  @ApiResponse({
    status: 201,
    description: 'The location has been successfully created.',
  })
  async create(
    @Body() createLocationDto: CreateRouteLocationDto,
  ): Promise<FreightRouteLocations> {
    return await this.routeLocationsService.create(createLocationDto);
  }

  @Get('route/:routeId')
  @ApiOperation({ summary: 'Get all locations for a specific route' })
  @ApiResponse({
    status: 200,
    description: 'Return all locations for the route.',
  })
  async findByRouteId(
    @Param('routeId') routeId: string,
  ): Promise<FreightRouteLocations[]> {
    return await this.routeLocationsService.findByRouteId(routeId);
  }

  @Get('route/:routeId/latest')
  @ApiOperation({ summary: 'Get the latest location for a specific route' })
  @ApiResponse({
    status: 200,
    description: 'Return the latest location for the route.',
  })
  async getLatestLocation(
    @Param('routeId') routeId: string,
  ): Promise<FreightRouteLocations> {
    return await this.routeLocationsService.getLatestLocation(routeId);
  }
}
