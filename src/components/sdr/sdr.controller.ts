import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { SdrService } from './srd.service';
import { ApiKeyGuard } from '../../guards/api-key.guard';
import {
  SdrCompanyListQueryDto,
  SdrCompanyListResponseDto,
} from './dto/sdr-company-list.dto';
import {
  SdrPostHistoryQueryDto,
  SdrPostHistoryResponseDto,
} from './dto/sdr-post-history.dto';
import {
  SdrMatchPerformanceQueryDto,
  SdrMatchPerformanceResponseDto,
} from './dto/sdr-match-performance.dto';
import {
  SdrDriverRetentionRiskQueryDto,
  SdrDriverRetentionRiskResponseDto,
} from './dto/sdr-driver-retention.dto';
import {
  SdrMarketHeatmapQueryDto,
  SdrMarketHeatmapResponseDto,
} from './dto/sdr-market-heatmap.dto';
import {
  SdrDriverActivityListQueryDto,
  SdrDriverActivityListResponseDto,
} from './dto/sdr-driver-activity.dto';
import {
  SdrFirstFreightAnalysisQueryDto,
  SdrFirstFreightAnalysisResponseDto,
} from './dto/sdr-first-freight-analysis.dto';
import {
  SdrPostingFrequencyQueryDto,
  SdrPostingFrequencyResponseDto,
} from './dto/sdr-posting-frequency.dto';

@ApiTags('SDR - Desenvolvimento de Vendas')
@Controller('sdr')
export class SdrController {
  constructor(private readonly sdrService: SdrService) {}

  @Get('companies')
  @ApiOperation({
    summary: 'Listar todas as empresas cadastradas',
    description:
      'Retorna uma lista paginada de todas as empresas cadastradas no sistema, incluindo informações de contato, telefones e status da assinatura. Este endpoint é útil para equipes de SDR realizarem prospecção e acompanhamento de clientes.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de empresas retornada com sucesso, incluindo dados de contatos e status de assinatura',
    type: SdrCompanyListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
  async listCompanies(
    @Query() query: SdrCompanyListQueryDto,
  ): Promise<SdrCompanyListResponseDto> {
    return this.sdrService.listCompanies(query.page, query.limit, query.startDate, query.endDate);
  }

  @Get('companies/post-history')
  @ApiOperation({
    summary: 'Obter histórico de fretes postados por uma empresa',
    description:
      'Retorna uma lista paginada com o histórico detalhado de todos os fretes postados por uma empresa específica. Inclui informações sobre rota (origem e destino), tipos de veículos aceitos, datas de coleta e entrega, tipo de carga e outros detalhes relevantes. Útil para análise de atividade e padrões de postagem de fretes.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Histórico de fretes retornado com sucesso, incluindo dados da rota, tipo de veículo e informações da carga',
    type: SdrPostHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos ou empresa não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  async getCompanyPostHistory(
    @Query() query: SdrPostHistoryQueryDto,
  ): Promise<SdrPostHistoryResponseDto> {
    return this.sdrService.getCompanyPostHistory(
      query.companyId,
      query.page,
      query.limit,
      query.startDate,
      query.endDate,
    );
  }

  @Get('companies/match-performance')
  @ApiOperation({
    summary: 'Analisar performance de resposta a solicitações de fretes',
    description:
      'Retorna uma lista paginada de fretes postados por empresas que receberam solicitações de motoristas mas ainda não foram respondidas. Ordenado pelas solicitações mais recentes. Mostra informações detalhadas sobre o frete, a empresa que postou, o motorista solicitante e o tempo decorrido sem resposta. Pode filtrar por empresa específica ou trazer dados de todas as empresas. Útil para análise de engajamento e tempo de resposta das empresas.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de solicitações pendentes retornada com sucesso, incluindo tempo sem resposta e informações do solicitante',
    type: SdrMatchPerformanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de autenticação inválido ou ausente',
  })
  async getMatchPerformance(
    @Query() query: SdrMatchPerformanceQueryDto,
  ): Promise<SdrMatchPerformanceResponseDto> {
    return this.sdrService.getMatchPerformance(
      query.companyId,
      query.page,
      query.limit,
      query.startDate,
      query.endDate,
    );
  }

  @Get('drivers/retention-risk')
  @ApiOperation({
    summary: 'Identificar motoristas em risco de churn',
    description:
      'Retorna uma lista paginada de motoristas cadastrados há um certo tempo mas que apresentam baixo ou nenhum engajamento com a plataforma. Identifica motoristas que nunca fizeram solicitações de fretes e analisa o tempo desde o cadastro. Útil para estratégias de retenção, reengajamento e identificação de problemas de onboarding. Os motoristas são classificados em níveis de risco (ALTO, MÉDIO, BAIXO) baseado no tempo de inatividade.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de motoristas em risco retornada com sucesso, incluindo estatísticas de risco e informações de veículos',
    type: SdrDriverRetentionRiskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de consulta inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de autenticação inválido ou ausente',
  })
  async getDriverRetentionRisk(
    @Query() query: SdrDriverRetentionRiskQueryDto,
  ): Promise<SdrDriverRetentionRiskResponseDto> {


    return this.sdrService.getDriverRetentionRisk(
      query.min_days_since_signup,
      query.never_requested,
      query.page,
      query.limit,
      query.startDate,
      query.endDate,
    );
  }

  /**
   * Endpoint 5: Mapa de calor de mercado
   * Analisa densidade de motoristas próximos às rotas de fretes postados
   * Identifica oportunidades de mercado baseado em disponibilidade de motoristas
   */
  @Get('market/heatmap')
  @ApiOperation({
    summary: 'Mapa de calor de mercado - Densidade de motoristas por rota',
    description:
      'Analisa todas as rotas de fretes ativos e conta quantos motoristas estão próximos da origem e destino de cada rota. ' +
      'Classifica o nível de oportunidade (ALTO/MÉDIO/BAIXO) baseado na quantidade total de motoristas disponíveis. ' +
      'Útil para identificar rotas com alta densidade de motoristas e priorizar ações comerciais.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rotas com análise de densidade de motoristas',
    type: SdrMarketHeatmapResponseDto,
  })
  async getMarketHeatmap(
    @Query() query: SdrMarketHeatmapQueryDto,
  ): Promise<SdrMarketHeatmapResponseDto> {
    return this.sdrService.getMarketHeatmap(query.page, query.limit, query.startDate, query.endDate);
  }

  /**
   * Endpoint 6: Lista de atividade de motoristas
   * Rastreia o ciclo de vida completo dos motoristas desde o cadastro até a ativação
   * Mostra dados de contato, veículos e status de engajamento
   */
  @Get('drivers/activity-list')
  @ApiOperation({
    summary: 'Lista de atividade de motoristas - Ciclo de vida e contato',
    description:
      'Lista todos os motoristas cadastrados mostrando data de cadastro, data de primeira ativação (primeira requisição de frete), ' +
      'tempo até ativação, veículo principal, meios de contato (telefone/email), última cidade conhecida e status de engajamento. ' +
      'Classifica motoristas como: NOVO (<7 dias), ATIVO (<30 dias desde ativação), INATIVO (>30 dias) ou NÃO ATIVADO (nunca fez requisição). ' +
      'Inclui estatísticas de taxa de ativação e tempo médio até ativação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de motoristas com dados de ativação e contato',
    type: SdrDriverActivityListResponseDto,
  })
  async getDriverActivityList(
    @Query() query: SdrDriverActivityListQueryDto,
  ): Promise<SdrDriverActivityListResponseDto> {
    return this.sdrService.getDriverActivityList(query.page, query.limit, query.startDate, query.endDate);
  }

  @Get('companies/first-freight-analysis')
  @ApiOperation({
    summary: 'Análise de tempo até primeiro frete - Velocidade de engajamento',
    description:
      'Analisa o tempo que empresas levam para publicar o primeiro frete após o cadastro. ' +
      'Mostra data de cadastro, data do primeiro frete publicado, tempo em dias até a primeira publicação, ' +
      'total de fretes publicados e meios de contato. Classifica empresas por velocidade de engajamento: ' +
      'RÁPIDO (<3 dias), MÉDIO (3-7 dias), LENTO (>7 dias) ou NÃO PUBLICOU (ainda não publicaram). ' +
      'Inclui estatísticas globais de tempo médio e distribuição por velocidade de engajamento. ' +
      'Pode filtrar por ID de empresa específica para análise individual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas com análise de tempo até primeiro frete',
    type: SdrFirstFreightAnalysisResponseDto,
  })
  async getFirstFreightAnalysis(
    @Query() query: SdrFirstFreightAnalysisQueryDto,
  ): Promise<SdrFirstFreightAnalysisResponseDto> {
    return this.sdrService.getFirstFreightAnalysis(
      query.page,
      query.limit,
      query.companyId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('companies/posting-frequency')
  @ApiOperation({
    summary: 'Frequência de publicação de fretes - Análise de atividade',
    description:
      'Analisa a frequência com que empresas publicam fretes na plataforma. ' +
      'Mostra total de fretes publicados, médias de publicação por dia/semana/mês, ' +
      'data do primeiro e último frete, dias de atividade e meios de contato. ' +
      'Classifica empresas por nível de atividade: ALTO (>10 fretes/semana), MÉDIO (3-10/semana), ' +
      'BAIXO (<3/semana) ou INATIVO (sem publicações). Inclui estatísticas gerais de volume ' +
      'e distribuição por nível de atividade. Pode filtrar por ID de empresa específica ' +
      'e escolher período de análise (diário, semanal ou mensal).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas com análise de frequência de publicação',
    type: SdrPostingFrequencyResponseDto,
  })
  async getPostingFrequency(
    @Query() query: SdrPostingFrequencyQueryDto,
  ): Promise<SdrPostingFrequencyResponseDto> {
    return this.sdrService.getPostingFrequency(
      query.page,
      query.limit,
      query.period,
      query.companyId,
      query.startDate,
      query.endDate,
    );
  }
}
