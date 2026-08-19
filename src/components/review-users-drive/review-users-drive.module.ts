import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewUserDrive } from '@entities/review-users-drive.entity';
import { ReviewUserDriveService } from './review-users-drive.service';
import { ReviewUserDriveController } from './review-users-drive.controller';
import { FreightRoutes } from '@entities/freight-routes.entity';
import { FreightRequest } from '@entities/freight-requests.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewUserDrive, FreightRoutes, FreightRequest]),
  ],
  controllers: [ReviewUserDriveController],
  providers: [ReviewUserDriveService],
})
export class ReviewUserDriveModule {}
