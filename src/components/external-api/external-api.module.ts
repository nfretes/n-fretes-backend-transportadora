import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersDrive } from '@entities/users-drive.entity';
import { Freight } from '@entities/freight.entity';
import { ExternalAuthController } from './controllers/external-auth.controller';
import { ExternalFreightController } from './controllers/external-freight.controller';
import { ExternalAuthService } from './services/external-auth.service';
import { ExternalFreightService } from './services/external-freight.service';
import { ExternalApiGuard } from './guards/external-api.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersDrive, Freight]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [ExternalAuthController, ExternalFreightController],
  providers: [ExternalAuthService, ExternalFreightService, ExternalApiGuard],
  exports: [ExternalAuthService, ExternalFreightService],
})
export class ExternalApiModule {}
