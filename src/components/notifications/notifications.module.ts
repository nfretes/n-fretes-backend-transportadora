import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller'; 
import { NotificationsService } from './notifications.service'; 
import { Notification } from '@entities/notification.entity'; 
import { UsersDrive } from '@entities/users-drive.entity'; 
import { Freight } from '@entities/freight.entity'; 
import { Company } from '@entities/company.entity'; 
import { FreightRequest } from '@entities/freight-requests.entity'; 
import { FreightRoutes } from '@entities/freight-routes.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      UsersDrive,
      Freight,
      Company,
      FreightRequest,
      FreightRoutes,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}