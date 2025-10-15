import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { ReviewUserDrive } from '@entities/review-users-drive.entity';
import { Freight } from '@entities/freight.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(FreightRoutes)
    private readonly freightRoutesRepository: Repository<FreightRoutes>,
    @InjectRepository(CompanyUsersContacts)
    private usersContactCompanyRepository: Repository<CompanyUsersContacts>,
    @InjectRepository(ReviewUserDrive)
    private reviewRepository: Repository<ReviewUserDrive>,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
  ) {}

  async getCompanyDashboard(userId: string) {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(
        currentYear,
        currentDate.getMonth() + 1,
        0,
      );
      const yearStart = new Date(`${currentYear}-01-01`);
      const yearEnd = new Date(`${currentYear}-12-31`);

      const [
        activeFreights,
        allYearFreights,
        reviews,
        driversCount,
        freightRoutes,
        allFreights,
      ] = await Promise.all([
        this.freightRepository.find({
          where: {
            companyId: userId,
            openSolicitations: true,
            isActive: true,
          },
        }),

        this.freightRepository.find({
          where: {
            companyId: userId,
            createdAt: Between(yearStart, yearEnd),
          },
        }),

        this.reviewRepository.find({
          where: { companyId: userId, isUserReviewingCompany: true },
          relations: ['userDrive'],
          order: { createdAt: 'DESC' },
        }),

        this.usersContactCompanyRepository.count({
          where: {
            companyId: userId,
            isActive: true,
            createdAt: Between(firstDayOfMonth, lastDayOfMonth),
          },
        }),

        // Fretes em andamento
        this.freightRoutesRepository.find({
          where: { companyId: userId, status: RouteStatus.IN_PROGRESS },
          relations: ['userDrive', 'freight'],
          select: {
            id: true,
            userDrive: { name: true },
            freight: { originCity: true, destinyCity: true },
          },
        }),

        // Todos os fretes para análise de destinos
        this.freightRepository.find({
          where: { companyId: userId },
          select: ['destinyCity'],
        }),
      ]);

      // Processamento dos fretes
      const freightCount = activeFreights.length;
      const averageFreightValue =
        freightCount > 0
          ? activeFreights.reduce(
              (sum, freight) => sum + freight.Valuefreight,
              0,
            ) / freightCount
          : 0;

      const yearlyTotal = allYearFreights.length;
      const monthlyAverage = yearlyTotal / currentMonth;

      // Processamento mensal
      const freightsByMonth = Array(currentMonth).fill(0);
      allYearFreights.forEach((freight) => {
        const month = new Date(freight.createdAt).getMonth();
        if (month < currentMonth) {
          freightsByMonth[month]++;
        }
      });

      const monthlyFreightsData = freightsByMonth.map((count, index) => ({
        month: index + 1,
        monthName: new Date(2000, index, 1).toLocaleString('pt-BR', {
          month: 'long',
        }),
        count,
      }));

      // Processamento das avaliações
      const latestReviews = reviews.slice(0, 2).map((review) => ({
        rating: review.rating,
        comment: review.comment || 'Sem comentário',
        userName: review.userDrive?.name || 'Anônimo',
        date: review.createdAt.toISOString().split('T')[0],
        photoUrl: review.userDrive?.photoFaceURL,
      }));

      const uniqueReviews = reviews.reduce((acc, review) => {
        if (
          review.userDriveId &&
          !acc.some((r) => r.userDriveId === review.userDriveId)
        ) {
          acc.push(review);
        }
        return acc;
      }, []);

      const averageRating =
        uniqueReviews.length > 0
          ? uniqueReviews.reduce((sum, review) => sum + review.rating, 0) /
            uniqueReviews.length
          : 0;

      const destinationCounts = allFreights.reduce(
        (acc, freight) => {
          if (freight.destinyCity) {
            acc[freight.destinyCity] = (acc[freight.destinyCity] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      const topDestinations = Object.entries(destinationCounts)
        .filter(([_, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }));

      return {
        freightStatistics: {
          activeCount: freightCount,
          averageValue: averageFreightValue,
          monthlyAverage,
          yearlyTotal,
          monthlyFreights: monthlyFreightsData,
          topDestinations,
        },
        ratingStatistics: {
          averageRating,
          totalRatings: uniqueReviews.length,
          latestReviews,
        },
        freightProguess: freightRoutes,
        driversCount,
      };
    } catch (error) {
      console.error('Dashboard Error:', error);
      throw new HttpException(
        'Failed to fetch dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
