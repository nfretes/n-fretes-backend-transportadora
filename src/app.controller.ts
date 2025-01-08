import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('Healthcheck')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthcheck')
  @ApiOperation({ summary: 'Verifica o status da API' })
  @ApiResponse({
    status: 200,
    description: 'A API está funcionando corretamente.',
    schema: {
      example: {
        status: 'UP',
        timestamp: '2024-06-26T18:25:43.511Z',
      },
    },
  })
  getHealthCheck(): Record<string, any> {
    return this.appService.getHealthCheck();
  }
}
