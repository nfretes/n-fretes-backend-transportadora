import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReviewUserDrive, ReviewTags } from '@entities/review-users-drive.entity';
import { CreateReviewDto } from './dto/create-review-dto';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';
import { ParamsReviewUsersDrives } from './interfaces/IReviewUsersDrive';
import { FreightRequest } from '@entities/freight-requests.entity';
import { DriverMetricsResponseDto } from './dto/driver-metrics-response.dto';
import { CompanyMetricsResponseDto } from './dto/company-metrics-response.dto';
import { CompanyReviewsAnalysisDto } from './dto/company-reviews-analysis.dto';
import { ReceivedReviewsResponseDto } from './dto/received-reviews-response.dto';
import { PendingReviewsResponseDto } from './dto/pending-reviews-response.dto';
import { SentReviewsResponseDto } from './dto/sent-reviews-response.dto';

@Injectable()
export class ReviewUserDriveService {
  constructor(
    @InjectRepository(ReviewUserDrive)
    private reviewRepository: Repository<ReviewUserDrive>,
    @InjectRepository(FreightRoutes)
    private freightRepository: Repository<FreightRoutes>,
    @InjectRepository(FreightRequest)
    private freightRequestRepository: Repository<FreightRequest>,
  ) {}

  async createReview(
    routeId: string,
    dto: CreateReviewDto,
    companyId: string,
  ): Promise<ReviewUserDrive> {
    try {
      const { userDriveId, freightId, rating, comment, tags } = dto;

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
        routeId,
        isCompanyReviewingUser: true,
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
    const { page = 1, take = 10 } = params;
    try {
      const queryBuilder =
        this.reviewRepository.createQueryBuilder('reviews_user_drive');

      queryBuilder
        .leftJoin('reviews_user_drive.userDrive', 'userDrive')
        .addSelect(['userDrive.name', 'userDrive.photoFaceURL', 'userDrive.id'])
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

  async getCompanyMetrics(
    companyId: string,
  ): Promise<CompanyMetricsResponseDto> {
    try {
      // 1. SATISFAÇÃO - Avaliações que a EMPRESA RECEBEU dos motoristas (4-5 estrelas)
      const receivedReviews = await this.reviewRepository.find({
        where: {
          companyId,
          isUserReviewingCompany: true,
        },
      });

      const totalReviewsReceived = receivedReviews.length;
      const satisfiedReviews = receivedReviews.filter(
        (r) => r.rating >= 4 && r.rating <= 5,
      ).length;
      const dissatisfiedReviews = receivedReviews.filter(
        (r) => r.rating >= 1 && r.rating <= 3,
      ).length;

      const satisfactionPercentage =
        totalReviewsReceived > 0
          ? (satisfiedReviews / totalReviewsReceived) * 100
          : 0;

      // 2. PEGAR TODOS OS FRETES COMPLETADOS
      const completedRoutes = await this.freightRepository.find({
        where: {
          companyId,
          status: RouteStatus.COMPLETED,
        },
      });

   
      const totalCompletedFreights = completedRoutes.length;
    
   
      const now = new Date();
      let reviewedFreights = 0;
      let onTimeReviews = 0;
      let lateReviews = 0;
      const notReviewedRouteIds: string[] = [];

      for (const route of completedRoutes) {
      
        const review = await this.reviewRepository.findOne({
          where: {
            routeId: route.id,
            companyId,
            isCompanyReviewingUser: true,
          },
        });


        if (review) {
          // Frete FOI avaliado
          reviewedFreights++;

          // Calcular SLA - tempo entre conclusão e avaliação
          const completedAt = new Date(route.completedAt);
          const reviewedAt = new Date(review.createdAt);
          const daysDiff =
            (reviewedAt.getTime() - completedAt.getTime()) /
            (1000 * 60 * 60 * 24);

          if (daysDiff <= 7) {
            onTimeReviews++;
          } else {
            lateReviews++;
          }
        } else {
          // Frete NÃO foi avaliado
          notReviewedRouteIds.push(route.id);
        }
      }

      const responseRate =
        totalCompletedFreights > 0
          ? (reviewedFreights / totalCompletedFreights) * 100
          : 0;

   
      const punctualityRate = 
        reviewedFreights > 0 
          ? (onTimeReviews / reviewedFreights) * 100 
          : 0;


      const slaCompliance = (
        (satisfactionPercentage * 0.4) +  
        (responseRate * 0.4) +           
        (punctualityRate * 0.2)           
      );

      
      const notReviewedFreights = notReviewedRouteIds.length;
      const pendingReviews = notReviewedFreights;

      // Pendentes ATRASADOS - Fretes completados há mais de 7 dias sem avaliação
      let overdueReviews = 0;

      for (const routeId of notReviewedRouteIds) {
        const route = completedRoutes.find((r) => r.id === routeId);
        if (route) {
          const completedAt = new Date(route.completedAt);
          const daysSinceCompletion =
            (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceCompletion > 7) {
            overdueReviews++;
          }
        }
      }

      return {
        companyId,
        satisfactionPercentage: Math.round(satisfactionPercentage * 10) / 10,
        totalReviewsReceived,
        satisfiedReviews,
        dissatisfiedReviews,
        responseRate: Math.round(responseRate * 10) / 10,
        totalCompletedFreights,
        reviewedFreights,
        notReviewedFreights,
        slaCompliance: Math.round(slaCompliance * 10) / 10,
        onTimeReviews,
        lateReviews,
        pendingReviews,
        overdueReviews,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar métricas da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDriverMetrics(
    userDriveId: string,
    companyId?: string,
  ): Promise<DriverMetricsResponseDto> {
    try {
      // Buscar todas as reviews do motorista
      const reviewsQuery = this.reviewRepository
        .createQueryBuilder('review')
        .leftJoin('review.userDrive', 'userDrive')
        .where('review.userDriveId = :userDriveId', { userDriveId })
        .andWhere('review.isCompanyReviewingUser = :isCompanyReviewingUser', {
          isCompanyReviewingUser: true,
        })
        .select(['review.rating', 'userDrive.name']);

      if (companyId) {
        reviewsQuery.andWhere('review.companyId = :companyId', { companyId });
      }

      const reviews = await reviewsQuery.getMany();
      const totalReviews = reviews.length;

      // Calcular satisfação (4 e 5 estrelas) e insatisfação (1, 2, 3 estrelas)
      const satisfiedReviews = reviews.filter(
        (r) => r.rating >= 4 && r.rating <= 5,
      ).length;
      const dissatisfiedReviews = reviews.filter(
        (r) => r.rating >= 1 && r.rating <= 3,
      ).length;

      const satisfactionPercentage =
        totalReviews > 0 ? (satisfiedReviews / totalReviews) * 100 : 0;
      const dissatisfactionPercentage =
        totalReviews > 0 ? (dissatisfiedReviews / totalReviews) * 100 : 0;

      // Buscar todas as solicitações do motorista
      const requestsQuery = this.freightRequestRepository
        .createQueryBuilder('request')
        .where('request.userDriveId = :userDriveId', { userDriveId });

      if (companyId) {
        requestsQuery.andWhere('request.companyId = :companyId', { companyId });
      }

      const allRequests = await requestsQuery.getMany();
      const totalRequests = allRequests.length;

      // Taxa de resposta
      const respondedRequests = allRequests.filter(
        (r) => r.status === 'ACCEPTED' || r.status === 'REJECTED',
      ).length;
      const notRespondedRequests = allRequests.filter(
        (r) => r.status === 'PENDING' || r.status === 'AWAITING_USER_DRIVE_RESPONSE',
      ).length;
      const pendingRequests = allRequests.filter(
        (r) => r.status === 'PENDING',
      ).length;

      const responseRate =
        totalRequests > 0 ? (respondedRequests / totalRequests) * 100 : 0;

      // Conformidade SLA - baseado nas tags de pontualidade nas reviews
      const reviewsWithTags = await this.reviewRepository
        .createQueryBuilder('review')
        .where('review.userDriveId = :userDriveId', { userDriveId })
        .andWhere('review.isCompanyReviewingUser = :isCompanyReviewingUser', {
          isCompanyReviewingUser: true,
        })
        .getMany();

      let onTimeDeliveries = 0;
      let lateDeliveries = 0;

      reviewsWithTags.forEach((review) => {
        if (review.tags && review.tags.length > 0) {
          const hasOnTimeTags = review.tags.some(
            (tag) =>
              tag === ReviewTags.ENTREGA_NO_PRAZO ||
              tag === ReviewTags.CUMPRE_HORARIO ||
              tag === ReviewTags.PONTUAL,
          );
          const hasLateTags = review.tags.some(
            (tag) =>
              tag === ReviewTags.ATRASADO ||
              tag === ReviewTags.ATRASO_NA_ENTREGA ||
              tag === ReviewTags.NAO_CUMPRE_HORARIO,
          );

          if (hasOnTimeTags) onTimeDeliveries++;
          if (hasLateTags) lateDeliveries++;
        }
      });

      const totalCompletedDeliveries = onTimeDeliveries + lateDeliveries;
      const slaCompliance =
        totalCompletedDeliveries > 0
          ? (onTimeDeliveries / totalCompletedDeliveries) * 100
          : 0;

      // Nome do motorista
      const driverName = reviews.length > 0 ? reviews[0].userDrive.name : '';

      return {
        userDriveId,
        driverName,
        satisfactionPercentage: Math.round(satisfactionPercentage * 10) / 10,
        dissatisfactionPercentage:
          Math.round(dissatisfactionPercentage * 10) / 10,
        totalReviews,
        satisfiedReviews,
        dissatisfiedReviews,
        responseRate: Math.round(responseRate * 10) / 10,
        totalRequests,
        respondedRequests,
        notRespondedRequests,
        slaCompliance: Math.round(slaCompliance * 10) / 10,
        totalCompletedDeliveries,
        onTimeDeliveries,
        lateDeliveries,
        pendingRequests,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar métricas do motorista',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCompanyReviewsAnalysis(
    companyId: string,
  ): Promise<CompanyReviewsAnalysisDto> {
    try {
      // Buscar todas as reviews que a empresa RECEBEU
      const reviews = await this.reviewRepository.find({
        where: {
          companyId,
          isUserReviewingCompany: true,
        },
      });

      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          starDistribution: [
            { stars: 5, count: 0, percentage: 0 },
            { stars: 4, count: 0, percentage: 0 },
            { stars: 3, count: 0, percentage: 0 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 },
          ],
          topTags: [],
          overallQuality: 'Sem avalia\u00e7\u00f5es',
        };
      }

      // Calcular média
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = parseFloat((totalRating / totalReviews).toFixed(1));

      // Distribuição por estrelas
      const starDistribution = [
        {
          stars: 5,
          count: reviews.filter((r) => r.rating === 5).length,
          percentage: 0,
        },
        {
          stars: 4,
          count: reviews.filter((r) => r.rating === 4).length,
          percentage: 0,
        },
        {
          stars: 3,
          count: reviews.filter((r) => r.rating === 3).length,
          percentage: 0,
        },
        {
          stars: 2,
          count: reviews.filter((r) => r.rating === 2).length,
          percentage: 0,
        },
        {
          stars: 1,
          count: reviews.filter((r) => r.rating === 1).length,
          percentage: 0,
        },
      ];

      // Calcular percentuais
      starDistribution.forEach((dist) => {
        dist.percentage = Math.round((dist.count / totalReviews) * 100);
      });

      // Contar tags mais citadas
      const tagCounts = new Map<ReviewTags, number>();
      reviews.forEach((review) => {
        if (review.tags && review.tags.length > 0) {
          review.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });

      // Mapear tags para labels e tipos
      const tagLabels: Record<ReviewTags, { label: string; type: 'positive' | 'negative' }> = {
        [ReviewTags.VEICULO_BOM_ESTADO]: { label: 'Ve\u00edculo em bom estado', type: 'positive' },
        [ReviewTags.ENTREGA_NO_PRAZO]: { label: 'Entrega no prazo', type: 'positive' },
        [ReviewTags.ATRASADO]: { label: 'Atrasado', type: 'negative' },
        [ReviewTags.ATRASO_NA_ENTREGA]: { label: 'Atraso na entrega', type: 'negative' },
        [ReviewTags.CUMPRE_HORARIO]: { label: 'Cumpre hor\u00e1rio', type: 'positive' },
        [ReviewTags.NAO_CUMPRE_HORARIO]: { label: 'N\u00e3o cumpre hor\u00e1rio', type: 'negative' },
        [ReviewTags.PONTUAL]: { label: 'Pontual', type: 'positive' },
        [ReviewTags.BOA_COMUNICACAO]: { label: 'Boa comunica\u00e7\u00e3o', type: 'positive' },
        [ReviewTags.CONVERSA_DIFICIL]: { label: 'Conversa dif\u00edcil', type: 'negative' },
        [ReviewTags.RESPONDE_RAPIDO]: { label: 'Responde r\u00e1pido', type: 'positive' },
        [ReviewTags.DEMORA_RESPONDER]: { label: 'Demora responder', type: 'negative' },
        [ReviewTags.FACIL_CONVERSA]: { label: 'F\u00e1cil conversa', type: 'positive' },
        [ReviewTags.MUITO_CONFIAVEL]: { label: 'Muito confi\u00e1vel', type: 'positive' },
        [ReviewTags.POUCO_CONFIAVEL]: { label: 'Pouco confi\u00e1vel', type: 'negative' },
        [ReviewTags.ABAIXO_DA_MEDIA]: { label: 'Abaixo da m\u00e9dia', type: 'negative' },
        [ReviewTags.EDUCADO]: { label: 'Educado', type: 'positive' },
        [ReviewTags.DESRESPEITOSO]: { label: 'Desrespeitoso', type: 'negative' },
        [ReviewTags.OTIMO_MOTORISTA]: { label: '\u00d3timo motorista', type: 'positive' },
      };

      // Top tags ordenadas por contagem
      const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({
          tag: ReviewTags[tag],
          label: tagLabels[tag]?.label || ReviewTags[tag],
          count,
          type: tagLabels[tag]?.type || 'positive',
        }));

      // Determinar qualidade geral
      let overallQuality = 'Regular';
      if (averageRating >= 4.5) overallQuality = 'Excelente';
      else if (averageRating >= 4.0) overallQuality = '\u00d3timo';
      else if (averageRating >= 3.0) overallQuality = 'Bom';
      else if (averageRating >= 2.0) overallQuality = 'Regular';
      else overallQuality = 'Ruim';

      return {
        averageRating,
        totalReviews,
        starDistribution,
        topTags,
        overallQuality,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar an\u00e1lise de reviews',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllReceivedReviews(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    period?: number, // Em dias: 30, 90, 365, ou undefined para todo período
  ): Promise<ReceivedReviewsResponseDto> {
    try {
      const skip = (page - 1) * limit;

      const queryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.userDrive', 'userDrive')
        .leftJoinAndSelect('review.freight', 'freight')
        .where('review.companyId = :companyId', { companyId })
        .andWhere('review.isUserReviewingCompany = :isUserReviewingCompany', {
          isUserReviewingCompany: true,
        });

      // Aplicar filtro de período se fornecido
      if (period) {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - period);
        queryBuilder.andWhere('review.createdAt >= :dateFrom', { dateFrom });
      }

      // Buscar TODAS as reviews do período para calcular distribuição e tags (sem paginação)
      const allReviews = await queryBuilder.getMany();
      const totalReviewsInPeriod = allReviews.length;

      // Calcular distribuição de estrelas
      const starDistribution = [
        {
          stars: 5,
          count: allReviews.filter((r) => r.rating === 5).length,
          percentage: 0,
        },
        {
          stars: 4,
          count: allReviews.filter((r) => r.rating === 4).length,
          percentage: 0,
        },
        {
          stars: 3,
          count: allReviews.filter((r) => r.rating === 3).length,
          percentage: 0,
        },
        {
          stars: 2,
          count: allReviews.filter((r) => r.rating === 2).length,
          percentage: 0,
        },
        {
          stars: 1,
          count: allReviews.filter((r) => r.rating === 1).length,
          percentage: 0,
        },
      ];

      // Calcular percentuais
      if (totalReviewsInPeriod > 0) {
        starDistribution.forEach((dist) => {
          dist.percentage = Math.round((dist.count / totalReviewsInPeriod) * 100);
        });
      }

      // Contar tags mais citadas
      const tagCounts = new Map<ReviewTags, number>();
      allReviews.forEach((review) => {
        if (review.tags && review.tags.length > 0) {
          review.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });

      // Mapear tags para labels e tipos
      const tagLabels: Record<ReviewTags, { label: string; type: 'positive' | 'negative' }> = {
        [ReviewTags.VEICULO_BOM_ESTADO]: { label: 'Veículo em bom estado', type: 'positive' },
        [ReviewTags.ENTREGA_NO_PRAZO]: { label: 'Entrega no prazo', type: 'positive' },
        [ReviewTags.ATRASADO]: { label: 'Atrasado', type: 'negative' },
        [ReviewTags.ATRASO_NA_ENTREGA]: { label: 'Atraso na entrega', type: 'negative' },
        [ReviewTags.CUMPRE_HORARIO]: { label: 'Cumpre horário', type: 'positive' },
        [ReviewTags.NAO_CUMPRE_HORARIO]: { label: 'Não cumpre horário', type: 'negative' },
        [ReviewTags.PONTUAL]: { label: 'Pontual', type: 'positive' },
        [ReviewTags.BOA_COMUNICACAO]: { label: 'Boa comunicação', type: 'positive' },
        [ReviewTags.CONVERSA_DIFICIL]: { label: 'Conversa difícil', type: 'negative' },
        [ReviewTags.RESPONDE_RAPIDO]: { label: 'Responde rápido', type: 'positive' },
        [ReviewTags.DEMORA_RESPONDER]: { label: 'Demora responder', type: 'negative' },
        [ReviewTags.FACIL_CONVERSA]: { label: 'Fácil conversa', type: 'positive' },
        [ReviewTags.MUITO_CONFIAVEL]: { label: 'Muito confiável', type: 'positive' },
        [ReviewTags.POUCO_CONFIAVEL]: { label: 'Pouco confiável', type: 'negative' },
        [ReviewTags.ABAIXO_DA_MEDIA]: { label: 'Abaixo da média', type: 'negative' },
        [ReviewTags.EDUCADO]: { label: 'Educado', type: 'positive' },
        [ReviewTags.DESRESPEITOSO]: { label: 'Desrespeitoso', type: 'negative' },
        [ReviewTags.OTIMO_MOTORISTA]: { label: 'Ótimo motorista', type: 'positive' },
      };

      // Top 5 tags ordenadas por contagem
      const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({
          tag: ReviewTags[tag],
          label: tagLabels[tag]?.label || ReviewTags[tag],
          count,
          type: tagLabels[tag]?.type || 'positive',
        }));

      // Agora buscar reviews PAGINADAS
      queryBuilder
        .orderBy('review.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const [reviews, total] = await queryBuilder.getManyAndCount();

      const data = reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        reviewer: {
          id: review.userDrive?.id || '',
          name: review.userDrive?.name || 'Motorista',
          photoUrl: review.userDrive?.photoFaceURL || '',
        },
        route: {
          originCity: review.freight?.originCity || '',
          originState: review.freight?.originState || '',
          destinyCity: review.freight?.destinyCity || '',
          destinyState: review.freight?.destinyState || '',
        },
        tags: review.tags ? review.tags.map((tag) => ReviewTags[tag]) : [],
        createdAt: review.createdAt,
      }));

      return {
        data,
        count: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        starDistribution,
        topTags,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar avalia\u00e7\u00f5es recebidas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSentReviews(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    period?: number, // Em dias: 30, 90, 365, ou undefined para todo período
  ): Promise<SentReviewsResponseDto> {
    try {
      const skip = (page - 1) * limit;

      const queryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.userDrive', 'userDrive')
        .leftJoinAndSelect('review.freight', 'freight')
        .where('review.companyId = :companyId', { companyId })
        .andWhere('review.isCompanyReviewingUser = :isCompanyReviewingUser', {
          isCompanyReviewingUser: true, // Empresa avaliando motorista
        });

      // Aplicar filtro de período se fornecido
      if (period) {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - period);
        queryBuilder.andWhere('review.createdAt >= :dateFrom', { dateFrom });
      }

      // Buscar TODAS as reviews do período para calcular distribuição e tags (sem paginação)
      const allReviews = await queryBuilder.getMany();
      const totalReviewsInPeriod = allReviews.length;

      // Calcular distribuição de estrelas
      const starDistribution = [
        {
          stars: 5,
          count: allReviews.filter((r) => r.rating === 5).length,
          percentage: 0,
        },
        {
          stars: 4,
          count: allReviews.filter((r) => r.rating === 4).length,
          percentage: 0,
        },
        {
          stars: 3,
          count: allReviews.filter((r) => r.rating === 3).length,
          percentage: 0,
        },
        {
          stars: 2,
          count: allReviews.filter((r) => r.rating === 2).length,
          percentage: 0,
        },
        {
          stars: 1,
          count: allReviews.filter((r) => r.rating === 1).length,
          percentage: 0,
        },
      ];

      // Calcular percentuais
      if (totalReviewsInPeriod > 0) {
        starDistribution.forEach((dist) => {
          dist.percentage = Math.round((dist.count / totalReviewsInPeriod) * 100);
        });
      }

      // Contar tags mais citadas
      const tagCounts = new Map<ReviewTags, number>();
      allReviews.forEach((review) => {
        if (review.tags && review.tags.length > 0) {
          review.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });

      // Mapear tags para labels e tipos
      const tagLabels: Record<ReviewTags, { label: string; type: 'positive' | 'negative' }> = {
        [ReviewTags.VEICULO_BOM_ESTADO]: { label: 'Veículo em bom estado', type: 'positive' },
        [ReviewTags.ENTREGA_NO_PRAZO]: { label: 'Entrega no prazo', type: 'positive' },
        [ReviewTags.ATRASADO]: { label: 'Atrasado', type: 'negative' },
        [ReviewTags.ATRASO_NA_ENTREGA]: { label: 'Atraso na entrega', type: 'negative' },
        [ReviewTags.CUMPRE_HORARIO]: { label: 'Cumpre horário', type: 'positive' },
        [ReviewTags.NAO_CUMPRE_HORARIO]: { label: 'Não cumpre horário', type: 'negative' },
        [ReviewTags.PONTUAL]: { label: 'Pontual', type: 'positive' },
        [ReviewTags.BOA_COMUNICACAO]: { label: 'Boa comunicação', type: 'positive' },
        [ReviewTags.CONVERSA_DIFICIL]: { label: 'Conversa difícil', type: 'negative' },
        [ReviewTags.RESPONDE_RAPIDO]: { label: 'Responde rápido', type: 'positive' },
        [ReviewTags.DEMORA_RESPONDER]: { label: 'Demora responder', type: 'negative' },
        [ReviewTags.FACIL_CONVERSA]: { label: 'Fácil conversa', type: 'positive' },
        [ReviewTags.MUITO_CONFIAVEL]: { label: 'Muito confiável', type: 'positive' },
        [ReviewTags.POUCO_CONFIAVEL]: { label: 'Pouco confiável', type: 'negative' },
        [ReviewTags.ABAIXO_DA_MEDIA]: { label: 'Abaixo da média', type: 'negative' },
        [ReviewTags.EDUCADO]: { label: 'Educado', type: 'positive' },
        [ReviewTags.DESRESPEITOSO]: { label: 'Desrespeitoso', type: 'negative' },
        [ReviewTags.OTIMO_MOTORISTA]: { label: 'Ótimo motorista', type: 'positive' },
      };

      // Top 5 tags ordenadas por contagem
      const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({
          tag: ReviewTags[tag],
          label: tagLabels[tag]?.label || ReviewTags[tag],
          count,
          type: tagLabels[tag]?.type || 'positive',
        }));

      // Agora buscar reviews PAGINADAS
      queryBuilder
        .orderBy('review.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const [reviews, total] = await queryBuilder.getManyAndCount();

      const data = reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        driver: {
          id: review.userDrive?.id || '',
          name: review.userDrive?.name || 'Motorista',
          photoUrl: review.userDrive?.photoFaceURL || '',
        },
        route: {
          originCity: review.freight?.originCity || '',
          originState: review.freight?.originState || '',
          destinyCity: review.freight?.destinyCity || '',
          destinyState: review.freight?.destinyState || '',
        },
        tags: review.tags ? review.tags.map((tag) => ReviewTags[tag]) : [],
        createdAt: review.createdAt,
      }));

      return {
        data,
        count: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        starDistribution,
        topTags,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar avaliações enviadas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPendingReviews(
    companyId: string,
  ): Promise<PendingReviewsResponseDto> {
    try {
      const completedRoutes = await this.freightRepository.find({
        where: {
          companyId,
          status: RouteStatus.COMPLETED,
        },
        relations: ['freight', 'userDrive'],
      });

      const pendingReviews = [];

      for (const route of completedRoutes) {
        const existingReview = await this.reviewRepository.findOne({
          where: {
            routeId: route.id,
            companyId,
            isCompanyReviewingUser: true,
          },
        });

      
        if (!existingReview) {
          pendingReviews.push({
            freightRouteId: route.id,
            freight: {
              id: route.freight?.id || '',
              originCity: route.freight?.originCity || '',
              originState: route.freight?.originState || '',
              destinyCity: route.freight?.destinyCity || '',
              destinyState: route.freight?.destinyState || '',
              product: route.freight?.product || '',
            },
            driver: {
              id: route.userDrive?.id || '',
              name: route.userDrive?.name || '',
              photoUrl: route.userDrive?.photoFaceURL || '',
              cpf: route.userDrive?.cpf || '',
            },
            completedAt: route.completedAt,
          });
        }
      }


      pendingReviews.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );

      return {
        data: pendingReviews,
        count: pendingReviews.length,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar avaliações pendentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLatestReceivedReview(companyId: string) {
    try {
      const review = await this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.userDrive', 'userDrive')
        .leftJoinAndSelect('review.freight', 'freight')
        .where('review.companyId = :companyId', { companyId })
        .andWhere('review.isUserReviewingCompany = :isUserReviewingCompany', {
          isUserReviewingCompany: true,
        })
        .orderBy('review.createdAt', 'DESC')
        .limit(1)
        .getOne();

      if (!review) {
        return null;
      }

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        reviewer: {
          id: review.userDrive?.id || '',
          name: review.userDrive?.name || 'Motorista',
          photoUrl: review.userDrive?.photoFaceURL || '',
        },
        route: {
          originCity: review.freight?.originCity || '',
          originState: review.freight?.originState || '',
          destinyCity: review.freight?.destinyCity || '',
          destinyState: review.freight?.destinyState || '',
        },
        tags: review.tags ? review.tags.map((tag) => ReviewTags[tag]) : [],
        createdAt: review.createdAt,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar última avaliação recebida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAvaliationSent(params: ParamsReviewUsersDrives) {
    const { page = 1, take = 10 } = params;
    try {
      const queryBuilder =
        this.reviewRepository.createQueryBuilder('reviews_user_drive');

      queryBuilder
        .leftJoin('reviews_user_drive.userDrive', 'userDrive')
        .leftJoin('userDrive.vehicles', 'vehicle')
        .leftJoin('userDrive.locations', 'location')
        .leftJoin('userDrive.freightRequest', 'freightRequest')
        .leftJoin('freightRequest.freight', 'freight')
        .where(
          'reviews_user_drive.isCompanyReviewingUser = :isCompanyReviewingUser',
          { isCompanyReviewingUser: true },
        )
        .addSelect([
          'userDrive.name',
          'userDrive.cnh',
          'userDrive.antt',
          'userDrive.pushToken',
          'userDrive.city',
          'userDrive.cpf',
          'userDrive.similiary',
          'userDrive.photoFaceURL',
          'userDrive.phoneNumber',
          'userDrive.isOnRoute',
          'userDrive.id',
          'userDrive.street',
          'userDrive.number',
          'userDrive.state',
          'userDrive.zipcode',
          'vehicle.vehicleType',
          'vehicle.bodyType',
          'vehicle.plateState',
          'vehicle.isPlateValid',
          'vehicle.isRenavamValid',
          'vehicle.tracker',
          'vehicle.locator',
          'vehicle.plateNumber',
          'location.city',
          'location.latitude',
          'location.longitude',
          'freight.originCity',
          'freight.destinyCity',
        ])
        .orderBy('reviews_user_drive.createdAt', 'DESC')
        .skip((page - 1) * take)
        .take(take);

      const [result, total] = await queryBuilder.getManyAndCount();

      return {
        data: result,
        count: total,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar reviews da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
