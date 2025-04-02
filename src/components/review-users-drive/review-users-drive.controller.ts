import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ReviewUserDriveService } from './review-users-drive.service';
import { CreateReviewDto } from './dto/create-review-dto';
import { ReviewUserDrive } from '@entities/review-users-drive.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { ParamsReviewUsersDrives } from './interfaces/IReviewUsersDrive';

@Controller('reviews-user-drive')
export class ReviewUserDriveController {
  constructor(private readonly reviewService: ReviewUserDriveService) {}
  @UseGuards(JwtAuthGuard)
  @Post(':routeId')
  async createReview(
    @Param('routeId') routeId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewUserDrive> {
    return this.reviewService.createReview(routeId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/rating')
  async getCompanyReviews(@GetUserId() companyId: string) {
    return this.reviewService.getAvaliationCompany(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getCompanyIdParams(@Query() params: ParamsReviewUsersDrives) {
    const result = await this.reviewService.getAvaliationReceivers(params);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/avaliation/sent')
  async getAvaliationSent(@Query() params: ParamsReviewUsersDrives) {
    const result = await this.reviewService.getAvaliationSent(params);
    return result;
  }
}
