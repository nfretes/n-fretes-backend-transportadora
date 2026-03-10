import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyOverviewService } from './company-overview.service';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';

@ApiTags('company-overview')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company-overview')
export class CompanyOverviewController {
  constructor(private readonly companyOverviewService: CompanyOverviewService) {}

  @Get('stats')
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial no formato DD/MM/YYYY — ex: 03/02/2026',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final no formato DD/MM/YYYY — ex: 04/03/2026',
  })
  async getStats(
    @GetUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.companyOverviewService.getCompanyStats(userId, startDate, endDate);
  }

  @Get('freights-by-day')
  async getFreightsByDay(@GetUserId() userId: string) {
    return this.companyOverviewService.getFreightsByDay(userId);
  }

  @Get('metrics')
  @ApiQuery({ name: 'startDate', required: false, description: 'DD/MM/YYYY' })
  @ApiQuery({ name: 'endDate', required: false, description: 'DD/MM/YYYY' })
  async getMetrics(
    @GetUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.companyOverviewService.getMetrics(userId, startDate, endDate);
  }

  @Get('kpis')
  @ApiQuery({ name: 'startDate', required: false, description: 'DD/MM/YYYY' })
  @ApiQuery({ name: 'endDate', required: false, description: 'DD/MM/YYYY' })
  async getKpis(
    @GetUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.companyOverviewService.getKpis(userId, startDate, endDate);
  }

  @Get('cycle-times')
  @ApiQuery({ name: 'startDate', required: false, description: 'DD/MM/YYYY' })
  @ApiQuery({ name: 'endDate', required: false, description: 'DD/MM/YYYY' })
  async getCycleTimes(
    @GetUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.companyOverviewService.getCycleTimes(userId, startDate, endDate);
  }

  @Get('freights-evolution')
  async getFreightsEvolution(@GetUserId() userId: string) {
    return this.companyOverviewService.getFreightsEvolution(userId);
  }

  @Get('critical-freights')
  async getCriticalFreights(@GetUserId() userId: string) {
    return this.companyOverviewService.getCriticalFreights(userId);
  }
}
