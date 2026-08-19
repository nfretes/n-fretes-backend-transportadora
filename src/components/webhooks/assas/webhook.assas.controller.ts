import { Controller, Post, Body } from '@nestjs/common';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AsaasService } from './webhook.assas.service';

@Controller('webhook-asaas')
export class WebhookAssasController {
  constructor(private readonly asaasService: AsaasService) {}

  @Post('subscription')
  @ApiOperation({ summary: 'Recebe eventos de webhook do Asaas' })
  @ApiResponse({ status: 200, description: 'Evento processado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao processar o evento.' })
  async handleAsaasReceivePayment(@Body() body: any) {
    await this.asaasService.processWebhookEvent(body);
    return { message: 'Evento processado com sucesso.' };
  }
}
