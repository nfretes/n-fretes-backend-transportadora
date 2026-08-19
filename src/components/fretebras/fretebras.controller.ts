import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  FretebrasService,
  ZApiGroupsResponse,
  ZApiAddParticipantResponse,
  AddParticipantDto,
  ZApiGroup,
  AddUsersToGroupsResponse,
} from './fretebras.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../../entities/company.entity';
import { Repository } from 'typeorm';
import { ContactCompany } from '../../entities/contact-company.entity';

@ApiTags('Fretebras - WhatsApp Groups')
@Controller('fretebras')
export class FretebrasController {
  private readonly logger = new Logger(FretebrasController.name);

  constructor(
    private readonly fretebrasService: FretebrasService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(ContactCompany)
    private readonly contactCompanyRepository: Repository<ContactCompany>,
  ) {}

  @Post('sync-missing')
  @ApiOperation({
    summary:
      'Criar companies e contatos para transportadoras ausentes no banco local',
  })
  async syncMissing(): Promise<any> {
    try {
      const res = await this.fretebrasService.syncMissingTransportadoras(
        this.companyRepository,
        this.contactCompanyRepository,
      );
      return res;
    } catch (error) {
      this.logger.error('Erro ao sincronizar transportadoras:', error.message);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao sincronizar transportadoras',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('missing')
  @ApiOperation({
    summary:
      'Listar transportadoras do Fretebras que não estão cadastradas localmente',
  })
  async getMissingTransportadoras(): Promise<any> {
    try {
      // create a pg client and pass company repository to service
      // We'll import company repository dynamically via TypeORM in controller
      // to avoid changing service DI signature.
      // use repository from nest injection if available
      // (we fetch repository via global TypeORM in controller constructor if needed)
      // For simplicity, use a new Client in service using env vars and pass this controller's companyRepo
      // Get repository via manual injection is not set here; instead, request service to use process.env and find companies via TypeORM repository
      // So we'll call the service and provide the company repository via (global) injection below.
      // NOTE: to provide the repository, get it from (this as any).companyRepository if present.
      // Fallback: use require to import AppDataSource or TypeORM manager.
      return await this.fretebrasService.getMissingTransportadoras(
        this.companyRepository,
      );
    } catch (error) {
      this.logger.error(
        'Erro ao buscar transportadoras faltantes:',
        error.message,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao buscar transportadoras faltantes',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('groups')
  @ApiOperation({
    summary: 'Listar todos os grupos do WhatsApp',
    description:
      'Retorna a lista de todos os grupos disponíveis na instância do WhatsApp',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos retornada com sucesso',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao buscar grupos',
  })
  async getGroups(): Promise<ZApiGroupsResponse> {
    try {
      return await this.fretebrasService.getGroups();
    } catch (error) {
      this.logger.error('Erro ao buscar grupos:', error.message);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao buscar grupos do WhatsApp',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('groups/:groupPhone')
  @ApiOperation({
    summary: 'Buscar informações de um grupo específico',
    description: 'Retorna as informações detalhadas de um grupo pelo telefone',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações do grupo retornadas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo não encontrado',
  })
  async getGroupInfo(
    @Param('groupPhone') groupPhone: string,
  ): Promise<ZApiGroup> {
    try {
      const group = await this.fretebrasService.getGroupInfo(groupPhone);

      if (!group) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Grupo ${groupPhone} não encontrado`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return group;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Erro ao buscar informações do grupo ${groupPhone}:`,
        error.message,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao buscar informações do grupo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('groups/add-participant')
  @ApiOperation({
    summary: 'Adicionar participante(s) a um grupo',
    description:
      'Adiciona um ou mais participantes a um grupo específico do WhatsApp',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        groupPhone: {
          type: 'string',
          example: '5511999999999-1234567890@g.us',
          description: 'Telefone/ID do grupo',
        },
        phone: {
          type: 'array',
          items: { type: 'string' },
          example: ['5511988888888', '5511977777777'],
          description:
            'Array de telefones dos participantes (com código do país)',
        },
      },
      required: ['groupPhone', 'phone'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Participante(s) adicionado(s) com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao adicionar participante(s)',
  })
  async addParticipantToGroup(
    @Body() addParticipantDto: AddParticipantDto,
  ): Promise<ZApiAddParticipantResponse> {
    try {
      const { groupPhone, phone } = addParticipantDto;

      if (!groupPhone || !phone || phone.length === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'groupPhone e phone são obrigatórios',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.fretebrasService.addParticipantToGroup(
        groupPhone,
        phone,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Erro ao adicionar participante:', error.message);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao adicionar participante ao grupo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('add-users-to-groups')
  @ApiOperation({
    summary: 'Adicionar todos os usuários aos grupos por região',
    description:
      'Busca todos os usuários drive e adiciona aos grupos do WhatsApp baseado na região (estado)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuários adicionados aos grupos com sucesso',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao adicionar usuários aos grupos',
  })
  async addUsersToGroups(): Promise<AddUsersToGroupsResponse> {
    try {
      return await this.fretebrasService.addUsersToGroupsByRegion();
    } catch (error) {
      this.logger.error(
        'Erro ao adicionar usuários aos grupos:',
        error.message,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao adicionar usuários aos grupos',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
