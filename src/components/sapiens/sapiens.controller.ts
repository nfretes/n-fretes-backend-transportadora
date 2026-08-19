import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SapiensService } from './sapiens.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { FreightQuote } from '@entities/freight-quote.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { GetUserId } from '../../decorators/get-user-decorator';

@ApiTags('sapiens')
@Controller('sapiens')
@UseGuards(JwtAuthGuard)
export class SapiensController {
  constructor(private readonly sapiensService: SapiensService) {}

  @Post('quote')
  @ApiOperation({ summary: 'Buscar cotação de frete' })
  @ApiResponse({
    status: 201,
    description: 'Cotação criada/encontrada com sucesso.',
    type: FreightQuote,
  })
  async getQuote(
    @GetUserId() userId: string,
    @Body() createQuoteDto: CreateQuoteDto,
  ): Promise<FreightQuote> {
    return await this.sapiensService.getQuote(userId, createQuoteDto);
  }

  @Get('quotes')
  @ApiOperation({ summary: 'Listar cotações do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de cotações do usuário.',
  })
  async getUserQuotes(
    @GetUserId() userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.sapiensService.getUserQuotes(userId, page, limit);
  }

  @Get('quote/:id')
  @ApiOperation({ summary: 'Buscar cotação por ID' })
  @ApiResponse({
    status: 200,
    description: 'Cotação encontrada.',
    type: FreightQuote,
  })
  async getQuoteById(
    @GetUserId() userId: string,
    @Param('id') id: string,
  ): Promise<FreightQuote> {
    return await this.sapiensService.getQuoteById(id, userId);
  }
}
