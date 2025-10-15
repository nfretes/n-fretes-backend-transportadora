import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateContactCompanyDto,
  UpdateContactCompanyDto,
} from './dto/contact-company.dto';
import { ContactCompanyResponseDto } from './dto/response-contact-company.dto';
import {
  ContactCompanyErroUpdate,
  ContactNotFound,
  CreateContactCompanySucess,
  GetCompanySucess,
  UpdateContactSucess,
} from 'src/common/contact-company-swagger/contact-company';
import { ContactCompanyService } from './contact-company.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { ParamsContactCompany } from './interfaces/IContact';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { ContactCompany } from '@entities/contact-company.entity';

@ApiTags('contact-company')
@Controller('contact-company')
export class ContactCompanyController {
  constructor(private readonly contactCompanyService: ContactCompanyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @ApiOperation({
    summary: 'Criação do contacto da empresa',
  })
  @ApiResponse(CreateContactCompanySucess)
  @ApiResponse({
    status: 500,
    description: 'Erro ao criar a contato da empresa',
  })
  async createContactCompany(
    @Body() createContactCompany: CreateContactCompanyDto,
    @GetUserId() userId: string,
  ): Promise<ContactCompanyResponseDto> {
    return this.contactCompanyService.createContactCompany(
      createContactCompany,
      userId,
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
    @Body() updateContactCompany: UpdateContactCompanyDto,
  ) {
    const result = await this.contactCompanyService.updateContactCompany(
      id,
      updateContactCompany,
    );
    return result;
  }

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Get('contact/:id')
  @ApiOperation({ summary: 'Traz o contato espefico por Id da empresa' })
  @ApiParam({
    name: 'id',
    description:
      'Id da contato para verificar se existe cadastrado na base de dados',
    type: String,
  })
  @ApiResponse(CreateContactCompanySucess)
  @ApiResponse(ContactNotFound)
  @ApiResponse(ContactCompanyErroUpdate)
  async getContactId(@Param('id') id: string) {
    const result = await this.contactCompanyService.getContactId(id);
    return result;
  }

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Get('company/contact')
  @ApiOperation({ summary: 'Traz o contato espefico por Id da empresa' })
  @ApiResponse(GetCompanySucess)
  @ApiResponse(ContactNotFound)
  @ApiResponse(ContactCompanyErroUpdate)
  async getCompanyIdParams(@Query() params: ParamsContactCompany) {
    const result = await this.contactCompanyService.getCompanyId(params);
    return result;
  }

  /********************************************************************************** */
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
    return this.contactCompanyService.softDeleteUsersContactCompany(id);
  }

  /********************************************************************************** */
  @ApiOperation({
    summary: 'Traz o contato espéfico por ID do contato da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do contato da empresa',
    type: String,
  })
  @Get(':id')
  async getContactCompanyById(
    @Param('id') id: string,
  ): Promise<ContactCompany> {
    return this.contactCompanyService.getContactCompanyById(id);
  }
}
