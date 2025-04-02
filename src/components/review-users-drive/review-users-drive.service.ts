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
import { ParamsReviewUsersDrives } from './interfaces/IReviewUsersDrive';

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

  async getAvaliationCompany(companyId: string) {
    try {
      const companyExists = await this.reviewRepository.findOne({
        where: { companyId },
        relations: ['userDrive'],
        select: {
          userDrive: {
            name: true,
          },
        },
      });

      if (!companyExists) {
        throw new NotFoundException('Empresa não encontrada');
      }

      const reviews = await this.reviewRepository.find({
        where: {
          companyId,
          isUserReviewingCompany: true,
        },
        relations: ['userDrive'],
        order: {
          createdAt: 'DESC',
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          userDrive: {
            id: true,
            name: true,
          },
        },
      });

      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingCounts: [
            { stars: 5, count: 0 },
            { stars: 4, count: 0 },
            { stars: 3, count: 0 },
            { stars: 2, count: 0 },
            { stars: 1, count: 0 },
          ],
          latestReview: null,
        };
      }

      const totalReviews = reviews.length;
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const averageRating = totalRating / totalReviews;

      const ratingCounts = [
        {
          stars: 5,
          count: reviews.filter((review) => review.rating === 5).length,
        },
        {
          stars: 4,
          count: reviews.filter((review) => review.rating === 4).length,
        },
        {
          stars: 3,
          count: reviews.filter((review) => review.rating === 3).length,
        },
        {
          stars: 2,
          count: reviews.filter((review) => review.rating === 2).length,
        },
        {
          stars: 1,
          count: reviews.filter((review) => review.rating === 1).length,
        },
      ];

      const latestReview =
        reviews.length > 0
          ? {
              id: reviews[0].id,
              userName: reviews[0].userDrive.name,
              rating: reviews[0].rating,
              comment: reviews[0].comment,
              date: reviews[0].createdAt,
            }
          : null;

      return {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)),
        ratingCounts,
        latestReview,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar avaliações da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAvaliationReceivers(params: ParamsReviewUsersDrives) {
    const { page = 1, take = 10} = params;
    try {
      const queryBuilder =
        this.reviewRepository.createQueryBuilder('reviews_user_drive');

      queryBuilder
        .leftJoin('reviews_user_drive.userDrive', 'userDrive')
        .addSelect([
          'userDrive.name',
          'userDrive.photoFaceURL',
          'userDrive.id',
        ])
        .skip((page - 1) * take)
        .take(take);

      const [result, total] = await queryBuilder.getManyAndCount();

      return {
        data: result,
        count: total,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro review da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
