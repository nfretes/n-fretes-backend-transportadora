import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExternalAuthService } from '../services/external-auth.service';

@Injectable()
export class ExternalApiGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private externalAuthService: ExternalAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'external_api') {
        throw new UnauthorizedException('Token inválido para esta API');
      }

      const user = await this.externalAuthService.validateUser(payload.sub);
      request.user = user;

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }
      throw new UnauthorizedException('Falha na autenticação');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
