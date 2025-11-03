import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDashboard(@GetUserId() userId: string) {
    return this.dashboardService.getCompanyDashboard(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('quick-stats')
  async getQuickStats(@GetUserId() userId: string) {
    return this.dashboardService.getQuickStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('freights-by-month')
  async getFreightsByMonth(@GetUserId() userId: string) {
    return this.dashboardService.getFreightsByMonth(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('freights-by-region')
  async getFreightsByRegion(@GetUserId() userId: string) {
    return this.dashboardService.getFreightsByRegion(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('top-drivers')
  async getTopDrivers(@GetUserId() userId: string) {
    return this.dashboardService.getTopDrivers(userId);
  }
}
