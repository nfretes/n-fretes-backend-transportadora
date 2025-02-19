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

import { FreightService } from './freight.service';
import { CreateFreightDto } from './dto/freight.dto';
import { ParamsFreight } from './interface/IFreight';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';

@ApiTags('freight')
@Controller('freight')
export class FreightController {
  constructor(private readonly freightService: FreightService) {}

  @UseGuards(JwtAuthGuard)
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
    @GetUserId() userId: string,
  ): Promise<CreateFreightDto> {
    return this.freightService.createFreightCompany(
      createFreightCompany,
      userId,
    );
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Realiza a busca por todos os fretes passando algum parametro de busca ou não',
  })
  async getCompanyIdParams(@Query() params: ParamsFreight) {
    const result = await this.freightService.getFreightsByTransporter(params);
    return result;
  }

  @Get('myfreights')
  @UseGuards(JwtAuthGuard)
  async geyMyFreightsParams(
    @Query() params: ParamsFreight,
    @GetUserId() userId: string,
  ) {
    const result = await this.freightService.getFreightsByUserId(
      params,
      userId,
    );
    return result;
  }

  /********************************************************************************** */
  @ApiOperation({
    summary: 'Desativa o frete da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do frete da empresa',
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/soft-delete')
  async softDelete(@Param('id') id: string): Promise<string> {
    return this.freightService.softDeleteFreight(id);
  }

  /********************************************************************************** */
  @ApiOperation({
    summary: 'Ativação do frete da empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do frete da empresa',
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/active-freight')
  async activeFreight(@Param('id') id: string): Promise<string> {
    return this.freightService.activateFreight(id);
  }

  /********************************************************************************** */

  @ApiOperation({
    summary:
      'Rota que tras cidades do frete baseado em suas região Norte, Sul, Sudeste',
  })
  @ApiParam({
    name: 'useriD',
    description: 'TokenId',
    type: String,
  })
  @Get('filtersCityOrDestiny')
  @UseGuards(JwtAuthGuard)
  async getFiltersDestinyOrCity(@GetUserId() userId: string) {
    const result = await this.freightService.classifyRegionByState(userId);
    return result;
  }
}
