import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReviewUserDrive } from '@entities/review-users-drive.entity';
import { CreateReviewDto } from './dto/create-review-dto';
import { FreightRoutes } from '@entities/freight-routes.entity';

@Injectable()
export class ReviewUserDriveService {
  constructor(
    @InjectRepository(ReviewUserDrive)
    private reviewRepository: Repository<ReviewUserDrive>,
    @InjectRepository(FreightRoutes)
    private freightRepository: Repository<FreightRoutes>,
  ) {}

  async createReview(
    routeId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewUserDrive> {
    try {
      const { userDriveId, freightId, companyId, rating, comment, tags } = dto;

      const freightRoutes = await this.freightRepository.findOne({
        where: { id: routeId },
      });
      if (!freightRoutes) {
        throw new HttpException(
          'Erro ao rota desse frete ',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      freightRoutes.avalationUserDrive = true;

      await this.freightRepository.save(freightRoutes);

      const review = this.reviewRepository.create({
        userDriveId,
        freightId,
        companyId,
        rating,
        comment,
        tags,
      });

      return this.reviewRepository.save(review);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro avaliar o motorista',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
