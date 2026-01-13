import { Body, Controller, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PgNotifyService } from './pg-notify.service';

@ApiTags('PG Notify')
@Controller('pg-notify')
export class PgNotifyController {
  private readonly logger = new Logger(PgNotifyController.name);

  constructor(private readonly pgNotifyService: PgNotifyService) {}

  @Post('reprocess-from-date')
  @ApiOperation({
    summary: 'Reprocessar fretes do Fretebras a partir de uma data',
    description:
      'Consulta os fretes na base Fretebras a partir da data informada e envia cada registro para a fila SQS usada pelo listener, recriando fretes/contatos se necessário.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          example: '2025-01-01T00:00:00',
          description: 'Data inicial (ISO ou formato aceito pelo PostgreSQL) para buscar fretes',
        },
      },
      required: ['date'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Processo disparado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Data inválida',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao reprocessar fretes',
  })
  async reprocessFromDate(@Body('date') date: string) {
    try {
      if (!date) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Campo "date" é obrigatório',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Data inválida, use um formato ISO (ex: 2025-01-01T00:00:00)',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.pgNotifyService.reprocessFreightsFromDate(parsed.toISOString());
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Erro ao reprocessar fretes pelo PG Notify:', error.message || error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao reprocessar fretes',
          error: error.message || String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
