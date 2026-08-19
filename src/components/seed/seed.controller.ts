import { Controller, Post, Param, Query, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiExcludeEndpoint,
  ApiBody,
} from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('company/:companyId/populate')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Popular dados fake para empresa',
    description:
      'Cria fretes, solicitações e contatos de motoristas fake para uma empresa',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID da empresa',
    example: '4875bd7f-91c5-47c6-85f2-928df87e33a3',
  })
  @ApiQuery({
    name: 'freightsCount',
    description: 'Quantidade de fretes a criar',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'contactsCount',
    description: 'Quantidade de contatos a criar',
    required: false,
    example: 5,
  })
  async populateCompanyData(
    @Param('companyId') companyId: string,
    @Query('freightsCount') freightsCount?: number,
    @Query('contactsCount') contactsCount?: number,
  ) {
    return await this.seedService.populateCompanyData(
      companyId,
      freightsCount || 10,
      contactsCount || 5,
    );
  }

  @Post('drivers/update-photos-locations')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Atualizar fotos e localizações dos motoristas',
    description:
      'Adiciona fotos aleatórias e localizações no Brasil para os motoristas especificados',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        driverIds: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '67069c87-3568-42ec-ad8d-70f4b49318b8',
            '1f9f2101-8c00-4eb3-bc95-a4ef4472b68d',
          ],
        },
      },
    },
  })
  async updateDriversPhotosAndLocations(@Body() body: { driverIds: string[] }) {
    return await this.seedService.updateDriversPhotosAndLocations(
      body.driverIds,
    );
  }

  @Post('company/:companyId/add-drivers-contacts')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Adicionar motoristas aos contatos da empresa',
    description:
      'Cria relacionamento entre empresa e motoristas na tabela company-users-contacts',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID da empresa',
    example: '4875bd7f-91c5-47c6-85f2-928df87e33a3',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        driverIds: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '67069c87-3568-42ec-ad8d-70f4b49318b8',
            '1f9f2101-8c00-4eb3-bc95-a4ef4472b68d',
          ],
        },
      },
    },
  })
  async addDriversToCompanyContacts(
    @Param('companyId') companyId: string,
    @Body() body: { driverIds: string[] },
  ) {
    return await this.seedService.addDriversToCompanyContacts(
      companyId,
      body.driverIds,
    );
  }

  @Post('drivers/update-data-vehicles')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Atualizar dados dos motoristas e criar veículos',
    description:
      'Adiciona CNH, endereço e cria veículo com placa aleatória para os motoristas especificados',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        driverIds: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '67069c87-3568-42ec-ad8d-70f4b49318b8',
            '1f9f2101-8c00-4eb3-bc95-a4ef4472b68d',
          ],
        },
      },
    },
  })
  async updateDriversDataAndVehicles(@Body() body: { driverIds: string[] }) {
    return await this.seedService.updateDriversDataAndVehicles(body.driverIds);
  }
}
