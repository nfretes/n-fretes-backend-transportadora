import { Body, Controller, Post, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ExcludeService } from './exclude.service';
import { CreateExcludeDto } from './dto/create-exclude.dto';

@ApiTags('exclude')
@Controller('exclude')
export class ExcludeController {
  constructor(private readonly excludeService: ExcludeService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar exclusão de conta', description: 'Registra uma solicitação de exclusão de conta.' })
  @ApiBody({ type: CreateExcludeDto })
  @ApiResponse({ status: 201, description: 'Solicitação registrada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async createExcludeRequest(@Body() dto: CreateExcludeDto) {
    return this.excludeService.createExcludeRequest(dto);
  }

  @Patch(':id/mark-deleted')
  @ApiOperation({ summary: 'Marcar conta como excluída', description: 'Marca uma solicitação como já processada/excluída.' })
  @ApiResponse({ status: 200, description: 'Conta marcada como excluída.' })
  @ApiResponse({ status: 400, description: 'Solicitação não encontrada.' })
  async markAsDeleted(@Param('id') id: string) {
    return this.excludeService.markAsDeleted(id);
  }
}
