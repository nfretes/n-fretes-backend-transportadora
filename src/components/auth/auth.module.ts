import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Company } from '@entities/company.entity';
import { RecoveryCode } from '@entities/recovery-codes.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { WhatsappService } from 'src/external/services/WHATSCODE/whatsapp-code.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { FeatureLog } from '@entities/feature-logs.entity';
import { FeatureUsage } from '@entities/feature-usage.entity';
import { ContactCompany } from '@entities/contact-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Company,
    RecoveryCode,
    UsersDrive,
    SubscriptionCompany,
    FeatureLog,
    FeatureUsage,
    ContactCompany
  ]),
  HttpModule
],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService, WhatsappService],
})
export class AuthModule {}
