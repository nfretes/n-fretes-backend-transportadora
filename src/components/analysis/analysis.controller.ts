import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Análise de fretes',
    description:
      'Retorna estatísticas de fretes postados, aceitos, concluídos, tempos médios e dados para gráfico de linha por período.',
  })
  async getAnalysis(
    @GetUserId() userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // Se não vier data, pega últimos 30 dias
    const start =
      startDate ||
      new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
    const end = endDate || new Date().toISOString().slice(0, 10);
    return this.analysisService.getAnalysis(userId, start, end);
  }
}
