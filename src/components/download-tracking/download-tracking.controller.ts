import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DownloadTrackingService } from './download-tracking.service';
import { PlatformType } from '@entities/users-count-dowload.entity';

class RegisterDownloadDto {
  platform: PlatformType;
}

@Controller('download-tracking')
@ApiTags('download-tracking')
export class DownloadTrackingController {
  constructor(
    private readonly downloadTrackingService: DownloadTrackingService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register app download click' })
  @ApiResponse({ status: 201, description: 'Download click registered successfully' })
  async registerDownload(@Body() body: RegisterDownloadDto) {
    const result = await this.downloadTrackingService.registerDownloadClick(
      body.platform,
    );

    return {
      status: 'success',
      message: 'Download click registered',
      data: {
        id: result.id,
        platform: result.platform,
        clickedAt: result.clickedAt,
      },
    };
  }
}
