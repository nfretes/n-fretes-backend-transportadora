import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadTrackingController } from './download-tracking.controller';
import { DownloadTrackingService } from './download-tracking.service';
import { UsersCountDownload } from '@entities/users-count-dowload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersCountDownload])],
  controllers: [DownloadTrackingController],
  providers: [DownloadTrackingService],
  exports: [DownloadTrackingService],
})
export class DownloadTrackingModule {}
