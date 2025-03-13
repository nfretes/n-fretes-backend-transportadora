import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheck(): Record<string, any> {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}
