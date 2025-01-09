import { Body, Controller, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { SubscriptionCompanyService } from './subscription-company.service';
import { SubscriptionCompanyResponseDto } from './dto/response-subscription.dto';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionCompanyDto,
} from './dto/subscription-company.dto';
import {
  CreateSubscriptionSucess,
  SubscriptionErroUpdateSubscription,
  SubscriptionNotFound,
  UpdateSubscriptionSucess,
} from 'src/common/subscription-company-swagger/subscription-company-swagger';

@ApiTags('subscription-company')
@Controller('subscription-company')
export class SubscriptionCompanyController {
  constructor(
    private readonly subscriptionCompanyService: SubscriptionCompanyService,
  ) {}

  @Post('/create')
  @ApiOperation({
    summary: 'Criação da subinscrição do usuário transportadora',
  })
  @ApiResponse(CreateSubscriptionSucess)
  @ApiResponse({
    status: 500,
    description: 'Erro ao criar a subscrição',
  })
  async createSubscriptionCompany(
    @Body() subscriptionCompany: CreateSubscriptionDto,
  ): Promise<SubscriptionCompanyResponseDto> {
    return this.subscriptionCompanyService.createSubscription(
      subscriptionCompany,
    );
  }

  /********************************************************************************** */
  @Patch('update/:companyId')
  @ApiOperation({ summary: 'Update da subscrição do usuário' })
  @ApiParam({
    name: 'companyId',
    description:
      'Id da empresa para verificar se existe cadastrado na base de dados',
    type: String,
  })
  @ApiResponse(UpdateSubscriptionSucess)
  @ApiResponse(SubscriptionNotFound)
  @ApiResponse(SubscriptionErroUpdateSubscription)
  async updateSubscription(
    @Param('companyId') companyId: string,
    @Body() updateSubscriptionCompany: UpdateSubscriptionCompanyDto,
  ) {
    const result = await this.subscriptionCompanyService.updateSubscription(
      companyId,
      updateSubscriptionCompany,
    );
    return result;
  }
}
