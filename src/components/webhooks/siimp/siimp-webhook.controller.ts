import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SiimpWebhookService } from './services/siimp-webhook.service';
import { CreateFreightWebhookDto } from './dto/create-freight-webhook.dto';
import { UpdateFreightWebhookDto } from './dto/update-freight-webhook.dto';
import { Freight } from '@entities/freight.entity';

@ApiTags('siimp-webhook')
@Controller('siimp/webhook')
export class SiimpWebhookController {
  constructor(private readonly siimpWebhookService: SiimpWebhookService) {}

  @Post('freight')
  @ApiOperation({
    summary: 'Criar frete via webhook SIIMP',
    description: `
    # Webhook SIIMP - Criação de Frete

    Este endpoint permite criar fretes através da integração SIIMP.

    ## Autenticação
    
    É necessário passar as credenciais nos headers:
    - **username**: Nome de usuário da integração SIIMP
    - **password**: Senha da integração SIIMP
    
    ## Campos Obrigatórios
    
    - **originCity**: Cidade de origem (string)
    - **originState**: Estado de origem (string) 
    - **destinyCity**: Cidade de destino (string)
    - **destinyState**: Estado de destino (string)
    - **dateReceiver**: Data de entrega (formato ISO 8601: YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)
    - **product**: Descrição do produto (string)
    - **specieOfLoad**: Tipo de carga (enum - ver valores aceitos abaixo)
    - **weightOfLoad**: Peso da carga (string)
    - **valueCall**: Métrica de peso (enum - ver valores aceitos)
    
    ## Campos Opcionais
    
    - **dateOrigin**: Data de coleta (formato ISO 8601)
    - **typeOfLoad**: Tipo de carregamento (enum - 'Completa' ou 'Complemento')
    - **lona**: Se necessita lona (boolean - true/false)
    - **tracker**: Se necessita rastreador (boolean - true/false)
    - **observation**: Observações sobre a carga (string)
    - **vehicleTypes**: Tipos de veículos aceitos (string)
    - **bodyTypes**: Tipos de carroceria aceitos (string)
    
    ## Valores aceitos para specieOfLoad:
    - Animais
    - Big Bag
    - Bobina
    - Caixas
    - Container
    - Diversos
    - Fardos
    - Fracionada
    - Granel
    - Metro cúbico
    - Milheiro
    - Mudanças
    - Palhetes
    - Passageiros
    - Sacos
    - Tambor
    - Unidades
    
    ## Valores aceitos para valueCall:
    - Por toneladas
    - Por quilos  
    - Por palhetes
    
    ## Valores aceitos para typeOfLoad:
    - Completa
    - Complemento
    `,
  })
  @ApiHeader({
    name: 'username',
    description: 'Nome de usuário da integração SIIMP',
    required: true,
    example: 'fblog',
  })
  @ApiHeader({
    name: 'password',
    description: 'Senha da integração SIIMP',
    required: true,
    example: '$1131435',
  })
  @ApiResponse({
    status: 201,
    description: 'Frete criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Frete criado com sucesso via webhook SIIMP',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas ou integração não ativa',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos no payload',
  })
  async createFreight(
    @Headers('username') username: string,
    @Headers('password') password: string,
    @Body() createFreightDto: CreateFreightWebhookDto,
  ): Promise<{ message: string }> {
    if (!username || !password) {
      throw new HttpException(
        'Headers username e password são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.siimpWebhookService.createFreight(
      username,
      password,
      createFreightDto,
    );
  }

  @Get('freights')
  @ApiOperation({
    summary: 'Listar fretes da empresa via webhook SIIMP',
    description: 'Lista os fretes da empresa autenticada com paginação',
  })
  @ApiHeader({
    name: 'username',
    description: 'Nome de usuário da integração SIIMP',
    required: true,
  })
  @ApiHeader({
    name: 'password',
    description: 'Senha da integração SIIMP',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fretes da empresa',
  })
  async getFreights(
    @Headers('username') username: string,
    @Headers('password') password: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    if (!username || !password) {
      throw new HttpException(
        'Headers username e password são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.siimpWebhookService.getCompanyFreights(
      username,
      password,
      page,
      limit,
    );
  }

  @Put('freight/:id')
  @ApiOperation({
    summary: 'Editar frete via webhook SIIMP',
    description: 'Edita um frete existente da empresa autenticada',
  })
  @ApiHeader({
    name: 'username',
    description: 'Nome de usuário da integração SIIMP',
    required: true,
  })
  @ApiHeader({
    name: 'password',
    description: 'Senha da integração SIIMP',
    required: true,
  })
  @ApiParam({
    name: 'id',
    description: 'ID do frete a ser editado',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Frete editado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Frete atualizado com sucesso via webhook SIIMP',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Frete não encontrado',
  })
  async updateFreight(
    @Headers('username') username: string,
    @Headers('password') password: string,
    @Param('id') freightId: string,
    @Body() updateFreightDto: UpdateFreightWebhookDto,
  ) {
    if (!username || !password) {
      throw new HttpException(
        'Headers username e password são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.siimpWebhookService.updateFreight(
      username,
      password,
      freightId,
      updateFreightDto,
    );
  }

  @Delete('freight/:id')
  @ApiOperation({
    summary: 'Excluir frete via webhook SIIMP',
    description: 'Exclui um frete da empresa autenticada (soft delete)',
  })
  @ApiHeader({
    name: 'username',
    description: 'Nome de usuário da integração SIIMP',
    required: true,
  })
  @ApiHeader({
    name: 'password',
    description: 'Senha da integração SIIMP',
    required: true,
  })
  @ApiParam({
    name: 'id',
    description: 'ID do frete a ser excluído',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Frete excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Frete excluído com sucesso via webhook SIIMP',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Frete não encontrado',
  })
  async deleteFreight(
    @Headers('username') username: string,
    @Headers('password') password: string,
    @Param('id') freightId: string,
  ) {
    if (!username || !password) {
      throw new HttpException(
        'Headers username e password são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.siimpWebhookService.deleteFreight(
      username,
      password,
      freightId,
    );
  }
}
