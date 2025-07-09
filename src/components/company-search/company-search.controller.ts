import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanySearchService } from './company-search.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';

@ApiTags('company-search')
@Controller('company-search')
export class CompanySearchController {
  constructor(private readonly service: CompanySearchService) {}
  
 
  @Get()
  @ApiOperation({ summary: 'Buscar transportadora por CNPJ' })
  @ApiResponse({ status: 200, description: 'Transportadora encontrada.' })
  @ApiResponse({ status: 404, description: 'Transportadora não encontrada.' })
  async findByCnpj(@Query('cnpj') cnpj: string) {
    return this.service.findByCnpj(cnpj);
  }

 
  @Get('receita')
  @ApiOperation({ summary: 'Consultar CNPJ na Receita Federal' })
  @ApiResponse({ status: 200, description: 'Dados do CNPJ encontrados.' })
  @ApiResponse({ status: 404, description: 'CNPJ não encontrado.' })
  @ApiResponse({ status: 400, description: 'CNPJ inválido.' })
  async getCnpjFromReceita(@Query('cnpj') cnpj: string) {
    return this.service.getCnpjData(cnpj);
  }
}