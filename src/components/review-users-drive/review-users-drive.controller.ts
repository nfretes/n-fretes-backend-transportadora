import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewUserDriveService } from './review-users-drive.service';
import { CreateReviewDto } from './dto/create-review-dto';
import { ReviewUserDrive } from '@entities/review-users-drive.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';

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
}
