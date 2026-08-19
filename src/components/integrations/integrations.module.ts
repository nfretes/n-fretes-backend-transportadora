import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { Integration } from '@entities/integrations.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { FreightRoutes } from '@entities/freight-routes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration, UsersDrive, FreightRoutes])],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
