import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { FreightRequestStatus } from '@entities/freight-requests.entity';
import { FreightRouteService } from './freight-route.service';
import { ParamsFreightRoute } from './interface/IFreightRoute';
import { RouteStatus } from '@entities/freight-routes.entity';

@Controller('freight-route')
export class FreightRouteController {
  constructor(private readonly freightRouteService: FreightRouteService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUserId() userId: string, @Query() params: ParamsFreightRoute) {
    return this.freightRouteService.findAll(userId, params);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') routeId: string,
    @Body('status') status: RouteStatus,
  ) {
    return this.freightRouteService.updateStatus(routeId, status);
  }

  @Get(':userId/statics')
  async getStatics(@Param('userId') userId: string) {
    return this.freightRouteService.getStaticsUserRoute(userId);
  }

@Get('avaliations')
  @UseGuards(JwtAuthGuard)
  async getAvalatiation(@GetUserId() userId: string, @Query() params: ParamsFreightRoute) {
    return this.freightRouteService.getAvalatiation(userId, params);
  }
}
