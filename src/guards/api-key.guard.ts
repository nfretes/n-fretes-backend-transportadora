import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const validApiKey = this.configService.get<string>('SDR_API_KEY') || 'sdr-secret-key-2026';

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Chave de API inválida ou ausente');
    }

    return true;
  }
}
