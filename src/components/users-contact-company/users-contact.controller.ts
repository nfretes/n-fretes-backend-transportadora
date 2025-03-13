import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
}
