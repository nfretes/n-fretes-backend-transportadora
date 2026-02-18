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
import { DriverMetricsResponseDto } from './dto/driver-metrics-response.dto';
import { CompanyMetricsResponseDto } from './dto/company-metrics-response.dto';
import { CompanyReviewsAnalysisDto } from './dto/company-reviews-analysis.dto';
import { ReceivedReviewsResponseDto } from './dto/received-reviews-response.dto';
import { PendingReviewsResponseDto } from './dto/pending-reviews-response.dto';
import { SentReviewsResponseDto } from './dto/sent-reviews-response.dto';

@Controller('reviews-user-drive')
export class ReviewUserDriveController {
  constructor(private readonly reviewService: ReviewUserDriveService) {}
  @UseGuards(JwtAuthGuard)
  @Post(':routeId')
  async createReview(
    @Param('routeId') routeId: string,
    @Body() dto: CreateReviewDto,
     @GetUserId() companyId: string,
  ): Promise<ReviewUserDrive> {
    return this.reviewService.createReview(routeId, dto,companyId);
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

  @UseGuards(JwtAuthGuard)
  @Get('driver/metrics/:userDriveId')
  async getDriverMetrics(
    @Param('userDriveId') userDriveId: string,
    @GetUserId() companyId: string,
  ): Promise<DriverMetricsResponseDto> {
    return this.reviewService.getDriverMetrics(userDriveId, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/metrics')
  async getCompanyMetrics(
    @GetUserId() companyId: string,
  ): Promise<CompanyMetricsResponseDto> {
    return this.reviewService.getCompanyMetrics(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/analysis')
  async getCompanyReviewsAnalysis(
    @GetUserId() companyId: string,
  ): Promise<CompanyReviewsAnalysisDto> {
    return this.reviewService.getCompanyReviewsAnalysis(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/received/latest')
  async getLatestReceivedReview(@GetUserId() companyId: string) {
    return this.reviewService.getLatestReceivedReview(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/pending')
  async getPendingReviews(
    @GetUserId() companyId: string,
  ): Promise<PendingReviewsResponseDto> {
    return this.reviewService.getPendingReviews(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/received')
  async getAllReceivedReviews(
    @GetUserId() companyId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('period') period?: number, // 30, 90, 365 ou undefined para todo período
  ): Promise<ReceivedReviewsResponseDto> {
    return this.reviewService.getAllReceivedReviews(companyId, page, limit, period);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/sent')
  async getAllSentReviews(
    @GetUserId() companyId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('period') period?: number, // 30, 90, 365 ou undefined para todo período
  ): Promise<SentReviewsResponseDto> {
    return this.reviewService.getAllSentReviews(companyId, page, limit, period);
  }
}
