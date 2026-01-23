import { Body, Controller, UseGuards, Put, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';

import { CompanyService } from './company.service';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { companyUpdateDto } from './dto/Company.dto';
import { companyUpdateDtoSwagger } from 'src/common/company-swagger/company-swagger';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @ApiOperation({
    summary: companyUpdateDtoSwagger.summary,
    description: companyUpdateDtoSwagger.description,
  })
  @ApiBody(companyUpdateDtoSwagger.requestBody)
  @ApiResponse(companyUpdateDtoSwagger.responses[200])
  @ApiResponse(companyUpdateDtoSwagger.responses[400])
  @ApiResponse(companyUpdateDtoSwagger.responses[500])
  async updatePlan(
    @GetUserId() userId: string,
    @Body() body: companyUpdateDto,
  ): Promise<{ message: string }> {
    return this.companyService.updateUserIdCompany(userId, body);
  }

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Get('is-success')
  @ApiOperation({
    summary: 'Verificar status de sucesso',
    description: 'Verifica se o campo isSucess está marcado como true ou false',
  })
  @ApiResponse({
    status: 200,
    description: 'Status verificado com sucesso',
    schema: {
      example: { isSucess: true },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  async checkIsSucess(
    @GetUserId() userId: string,
  ): Promise<{ isSucess: boolean }> {
    return this.companyService.checkIsSucess(userId);
  }

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Patch('mark-success')
  @ApiOperation({
    summary: 'Marcar como sucesso',
    description: 'Atualiza o campo isSucess para true',
  })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso',
    schema: {
      example: { message: 'Status atualizado com sucesso' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  async updateIsSucess(
    @GetUserId() userId: string,
  ): Promise<{ message: string }> {
    return this.companyService.updateIsSucess(userId);
  }

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Get('subscription-validity')
  @ApiOperation({
    summary: 'Verificar validade da assinatura',
    description: 'Verifica se a assinatura da empresa está válida, checando o trialEndDate e status',
  })
  @ApiResponse({
    status: 200,
    description: 'Validade verificada com sucesso',
    schema: {
      example: {
        isValid: true,
        status: 1,
        isInTrial: true,
        trialEndDate: '2026-02-23T00:00:00.000Z',
        message: 'Assinatura em período trial válido',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao verificar validade',
  })
  async checkSubscriptionValidity(
    @GetUserId() userId: string,
  ): Promise<{
    isValid: boolean;
    status: number;
    isInTrial: boolean;
    trialEndDate: Date | null;
    message: string;
  }> {
    return this.companyService.checkSubscriptionValidity(userId);
  }
}
