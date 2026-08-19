import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationStatus } from '@entities/integrations.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';
import { DriverStatusResponse } from './interface/IIntegration';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
  IntegrationLoginDto,
  IntegrationTokenDto,
} from './dto/integration-auth.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationsRepository: Repository<Integration>,
    @InjectRepository(UsersDrive)
    private usersDriveRepository: Repository<UsersDrive>,
    @InjectRepository(FreightRoutes)
    private freightRoutesRepository: Repository<FreightRoutes>,
    private configService: ConfigService,
  ) {}

  async createIntegration(data: {
    name: string;
    username: string;
    password: string;
    companyName?: string;
    contactEmail?: string;
    contactPhone?: string;
    permissions?: any;
    metadata?: any;
  }): Promise<Integration> {
    // Verificar se username já existe
    const existing = await this.integrationsRepository.findOne({
      where: { username: data.username },
    });

    if (existing) {
      throw new HttpException('Username já cadastrado', HttpStatus.CONFLICT);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar integração
    const integration = this.integrationsRepository.create({
      name: data.name,
      username: data.username,
      password: hashedPassword,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      permissions: data.permissions,
      metadata: data.metadata,
      status: IntegrationStatus.ACTIVE,
    });

    return await this.integrationsRepository.save(integration);
  }

  async login(loginDto: IntegrationLoginDto): Promise<IntegrationTokenDto> {
    const { username, password } = loginDto;

    const integration = await this.integrationsRepository.findOne({
      where: { username, status: IntegrationStatus.ACTIVE },
    });

    if (!integration) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      integration.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.generateAccessToken(
      integration.id,
      integration.username,
    );
    const refreshToken = this.generateRefreshToken(integration.id);

    integration.refreshToken = refreshToken;
    integration.lastUsedAt = new Date();
    integration.requestCount += 1;
    await this.integrationsRepository.save(integration);

    return {
      accessToken,
      refreshToken,
      expiresIn: 1800,
    };
  }

  async refreshToken(oldRefreshToken: string): Promise<IntegrationTokenDto> {
    const integration = await this.integrationsRepository.findOne({
      where: {
        refreshToken: oldRefreshToken,
        status: IntegrationStatus.ACTIVE,
      },
    });

    if (!integration) {
      throw new HttpException(
        'Refresh token inválido',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      jwt.verify(oldRefreshToken, secret);
    } catch (error) {
      throw new HttpException(
        'Refresh token expirado',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = this.generateAccessToken(
      integration.id,
      integration.username,
    );
    const refreshToken = this.generateRefreshToken(integration.id);

    integration.refreshToken = refreshToken;
    await this.integrationsRepository.save(integration);

    return {
      accessToken,
      refreshToken,
      expiresIn: 1800,
    };
  }

  async validateToken(token: string): Promise<Integration> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = jwt.verify(token, secret) as { sub: string };

      const integration = await this.integrationsRepository.findOne({
        where: { id: decoded.sub, status: IntegrationStatus.ACTIVE },
      });

      if (!integration) {
        throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
      }

      return integration;
    } catch (error) {
      throw new HttpException(
        'Token inválido ou expirado',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getDriverStatusByCpf(cpf: string): Promise<DriverStatusResponse> {
    const cleanCpf = cpf.replace(/\D/g, '');

    const formattedCpf = cleanCpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4',
    );
    const driver = await this.usersDriveRepository
      .createQueryBuilder('driver')
      .where('driver.cpf = :cleanCpf', { cleanCpf })
      .orWhere('driver.cpf = :formattedCpf', { formattedCpf })
      .getOne();

    if (!driver) {
      throw new HttpException('Motorista não encontrado', HttpStatus.NOT_FOUND);
    }

    const activeRoute = await this.freightRoutesRepository.findOne({
      where: {
        userDriveId: driver.id,
        status: RouteStatus.IN_PROGRESS,
        isActive: true,
      },
      relations: ['freight'],
    });

    return {
      nome: driver.name,
      cpf: cleanCpf,
      rota_ativa: !!activeRoute,
      origem: activeRoute?.freight?.originCity || null,
      destino: activeRoute?.freight?.destinyCity || null,
    };
  }

  private generateAccessToken(integrationId: string, username: string): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    return jwt.sign({ sub: integrationId, username }, secret, {
      expiresIn: '30m',
    });
  }

  private generateRefreshToken(integrationId: string): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    return jwt.sign({ sub: integrationId }, secret, { expiresIn: '7d' });
  }
}
