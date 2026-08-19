import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import {
  ContactCompanyErroUpdate,
  ContactNotFound,
  UpdateContactSucess,
} from 'src/common/contact-company-swagger/contact-company';
import { UsersContactCompanyService } from './users-contact.service';
import {
  CompanyUsersContactsDto,
  updateCompanyUsersContactsDto,
} from './dto/users-contact.dto';
import {
  CreateContactUsersCompanySucess,
  GetUsersCompanySucess,
} from 'src/common/users-contact-company-swagger/users-contact-company-swagger';
import { ParamsUsersContactCompany } from './interfaces/IUsersContanctCompany';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';

@ApiTags('users-contact-company')
@Controller('users-contact-company')
export class UsersContactCompanyController {
  constructor(
    private readonly usersContactCompanyService: UsersContactCompanyService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @ApiOperation({
    summary: 'Criação do contacto da empresa de caminhoneiro',
  })
  @ApiResponse(CreateContactUsersCompanySucess)
  @ApiResponse({
    status: 500,
    description: 'Erro ao criar a contato da empresa',
  })
  async createUsersContactCompany(
    @Body() usersContactCompanyService: CompanyUsersContactsDto,
  ): Promise<CompanyUsersContactsDto> {
    return this.usersContactCompanyService.createUsersContactCompany(
      usersContactCompanyService,
    );
  }

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualização de contato da empresa' })
  @ApiParam({
    name: 'id',
    description:
      'Id da contato para verificar se existe cadastrado na base de dados',
    type: String,
  })
  @ApiResponse(UpdateContactSucess)
  @ApiResponse(ContactNotFound)
  @ApiResponse(ContactCompanyErroUpdate)
  async updateContactCompany(
    @Param('id') id: string,
    @Body() updateContactCompany: updateCompanyUsersContactsDto,
  ) {
    const result =
      await this.usersContactCompanyService.updateUsersContactCompany(
        id,
        updateContactCompany,
      );
    return result;
  }

  /********************************************************************************** */
  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  @ApiOperation({
    summary: 'Traz o contato espefico pelo parametro passado pelo usuário',
  })
  @ApiResponse(GetUsersCompanySucess)
  @ApiResponse(ContactNotFound)
  @ApiResponse(ContactCompanyErroUpdate)
  async getCompanyIdParams(@Query() params: ParamsUsersContactCompany) {
    const result =
      await this.usersContactCompanyService.getContactParamsUsers(params);
    return result;
  }

  /********************************************************************************** */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Remove da lista de contatos da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do contato da empresa',
    type: String,
  })
  @Delete(':id/soft-delete')
  async softDelete(@Param('id') id: string): Promise<string> {
    return this.usersContactCompanyService.softDeleteUsersContactCompany(id);
  }

  /********************************************************************************** */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Remove da lista de contatos da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do contato da empresa',
    type: String,
  })
  @Get(':cpf/contact')
  async searchByCpf(@Param('cpf') cpf: string, @GetUserId() userId: string) {
    return this.usersContactCompanyService.searchUsersByCpf(cpf, userId);
  }

  /********************************************************************************** */
  @Get(':id/contact-info')
  @ApiOperation({
    summary:
      'Verifica status de registro do contato e retorna dados da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do ContactCompany',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Informações do contato da empresa retornadas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Contato da empresa não encontrado',
  })
  async getContactCompanyInfo(@Param('id') id: string) {
    return this.usersContactCompanyService.getContactCompanyInfo(id);
  }

  // ──────────────── DOCUMENTOS DO MOTORISTA ────────────────

  @UseGuards(JwtAuthGuard)
  @Post(':driverId/documents')
  @ApiOperation({ summary: 'Upload de documento para um motorista da empresa' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/png', 'image/jpeg', 'image/jpg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de arquivo não permitido. Use PNG, JPG, PDF ou DOCX.'), false);
        }
      },
    }),
  )
  async uploadDriverDocument(
    @GetUserId() companyId: string,
    @Param('driverId') driverId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ) {
    return this.usersContactCompanyService.uploadDriverDocument(
      companyId,
      driverId,
      file,
      description,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':driverId/documents')
  @ApiOperation({ summary: 'Lista documentos de um motorista da empresa' })
  async listDriverDocuments(
    @GetUserId() companyId: string,
    @Param('driverId') driverId: string,
  ) {
    return this.usersContactCompanyService.listDriverDocuments(companyId, driverId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('documents/:documentId')
  @ApiOperation({ summary: 'Remove (soft delete) um documento do motorista' })
  async deleteDriverDocument(
    @GetUserId() companyId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.usersContactCompanyService.deleteDriverDocument(companyId, documentId);
  }
}
