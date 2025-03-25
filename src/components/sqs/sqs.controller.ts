import { Controller, Post, Body } from '@nestjs/common';
import { SQSService } from './sqs.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('queue')
@ApiTags('queue') 
export class SqsController {
  constructor(private readonly sqsService: SQSService) {}

  @Post('freight-sharing')
  async notifyFreightSharing(
    @Body() body: { freightId: string; userIds: string[] }
  ) {
    await this.sqsService.notifyFreightSharing(
      body.freightId,
      body.userIds
    );
    
    return { 
      status: 'success',
      message: 'Frete compartilhado com sucesso'
    };
  }
}