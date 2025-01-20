import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { FreightService } from './freight.service';
import { CreateFreightDto } from './dto/freight.dto';
import { ParamsFreight } from './interface/IFreight';

@ApiTags('freight')
@Controller('freight')
export class FreightController {
  constructor(private readonly freightService: FreightService) {}

  @Post('/create')
  @ApiOperation({
    summary: 'Criação do frete da empresa',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao criar a contato da empresa',
  })
  async createFreightCompany(
    @Body() createFreightCompany: CreateFreightDto,
  ): Promise<CreateFreightDto> {
    return this.freightService.createFreightCompany(createFreightCompany);
  }

  /********************************************************************************** */

  /* @Patch(':id')
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
  } */

  /********************************************************************************** */

  /* @Get('contact/:id')
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
  } */

  /********************************************************************************** */

  @Get('freight')
  @ApiOperation({
    summary:
      'Realiza a busca por todos os fretes passando algum parametro de busca ou não',
  })
  async getCompanyIdParams(@Query() params: ParamsFreight) {
    const result = await this.freightService.getFreightsByTransporter(params);
    return result;
  }
}
