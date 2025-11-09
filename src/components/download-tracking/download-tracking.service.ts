import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UsersCountDownload,
  PlatformType,
} from '@entities/users-count-dowload.entity';

@Injectable()
export class DownloadTrackingService {
  constructor(
    @InjectRepository(UsersCountDownload)
    private readonly downloadRepository: Repository<UsersCountDownload>,
  ) {}

  async registerDownloadClick(
    platform: PlatformType,
  ): Promise<UsersCountDownload> {
    console.log(platform, 'platform received');

    const download = this.downloadRepository.create({
      platform,
    });

    return await this.downloadRepository.save(download);
  }
}
