import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { FreightRoutes } from '@entities/freight-routes.entity';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { ReviewUserDrive } from '@entities/review-users-drive.entity';
import { Freight } from '@entities/freight.entity';
import { FreightRequest } from '@entities/freight-requests.entity';
import { Vehicle } from '@entities/vehicles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FreightRoutes,
      CompanyUsersContacts,
      ReviewUserDrive,
      Freight,
      FreightRequest,
      Vehicle,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
