import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { ReviewUserDrive } from '@entities/review-users-drive.entity';
import { Freight } from '@entities/freight.entity';
import {
  FreightRequest,
  FreightRequestStatus,
} from '@entities/freight-requests.entity';
import { Vehicle } from '@entities/vehicles.entity';

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
    @InjectRepository(FreightRequest)
    private freightRequestRepository: Repository<FreightRequest>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
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
          select: ['id', 'Valuefreight'], // só buscar campos necessários
        }),

        this.freightRepository.find({
          where: {
            companyId: userId,
            createdAt: Between(yearStart, yearEnd),
          },
          select: ['id', 'createdAt'], // só buscar campos necessários
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

      // Nova funcionalidade: Distribuição de ratings
      const ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      uniqueReviews.forEach((review) => {
        const rating = Math.floor(review.rating); // Garante que seja um número inteiro
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating]++;
        }
      });

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
          ratingDistribution,
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

  async getQuickStats(userId: string) {
    try {
      const [
        activeFreightsCount,
        totalFreightsCount,
        openSolicitations,
        pendingReviews,
        driversInProgress,
      ] = await Promise.all([
        this.freightRepository.count({
          where: {
            companyId: userId,
            openSolicitations: true,
            isActive: true,
          },
        }),

        this.freightRepository.count({
          where: {
            companyId: userId,
          },
        }),

        this.freightRequestRepository
          .createQueryBuilder('freightRequest')
          .leftJoin('freightRequest.freight', 'freight')
          .where('freightRequest.companyId = :userId', { userId })
          .andWhere('freightRequest.status = :status', {
            status: FreightRequestStatus.PENDING,
          })
          .andWhere('freight.isActive = :isActive', { isActive: true })
          .andWhere('freight.openSolicitations = :openSolicitations', {
            openSolicitations: true,
          })
          .getCount(),

        this.freightRoutesRepository
          .createQueryBuilder('route')
          .leftJoin(
            'route.reviewUserDrive',
            'review',
            'review.routeId = route.id AND review.isCompanyReviewingUser = true',
          )
          .where('route.companyId = :userId', { userId })
          .andWhere('route.status = :status', { status: 'COMPLETED' })
          .andWhere('review.id IS NULL')
          .getCount(),

        this.freightRoutesRepository.count({
          where: {
            companyId: userId,
            status: RouteStatus.IN_PROGRESS,
          },
        }),
      ]);

      return {
        activeFreights: activeFreightsCount,
        totalFreights: totalFreightsCount,
        openSolicitations: openSolicitations,
        pendingReviews: pendingReviews,
        driversInProgress: driversInProgress,
      };
    } catch (error) {
      console.error('Quick Stats Error:', error);
      throw new HttpException(
        'Failed to fetch quick stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFreightsByMonth(userId: string) {
    try {
      const currentYear = new Date().getFullYear();

      const freights = await this.freightRepository
        .createQueryBuilder('freight')
        .select('EXTRACT(MONTH FROM freight.createdAt)', 'month')
        .addSelect('COUNT(*)', 'count')
        .where('freight.companyId = :userId', { userId })
        .andWhere('EXTRACT(YEAR FROM freight.createdAt) = :year', {
          year: currentYear,
        })
        .groupBy('EXTRACT(MONTH FROM freight.createdAt)')
        .orderBy('EXTRACT(MONTH FROM freight.createdAt)', 'ASC')
        .getRawMany();

      const monthlyData = freights.map((item) => {
        const monthNumber = parseInt(item.month);
        const monthName = new Date(
          currentYear,
          monthNumber - 1,
          1,
        ).toLocaleString('pt-BR', {
          month: 'long',
        });

        return {
          monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          count: parseInt(item.count),
        };
      });

      return monthlyData;
    } catch (error) {
      console.error('Freights by Month Error:', error);
      throw new HttpException(
        'Failed to fetch freights by month',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFreightsByRegion(userId: string) {
    try {
      const stateToRegion = {
        AC: 'Norte',
        AP: 'Norte',
        AM: 'Norte',
        PA: 'Norte',
        RO: 'Norte',
        RR: 'Norte',
        TO: 'Norte',
        AL: 'Nordeste',
        BA: 'Nordeste',
        CE: 'Nordeste',
        MA: 'Nordeste',
        PB: 'Nordeste',
        PE: 'Nordeste',
        PI: 'Nordeste',
        RN: 'Nordeste',
        SE: 'Nordeste',
        GO: 'Centro-Oeste',
        MT: 'Centro-Oeste',
        MS: 'Centro-Oeste',
        DF: 'Centro-Oeste',
        ES: 'Sudeste',
        MG: 'Sudeste',
        RJ: 'Sudeste',
        SP: 'Sudeste',
        PR: 'Sul',
        RS: 'Sul',
        SC: 'Sul',
      };

      const freights = await this.freightRepository.find({
        where: { companyId: userId },
        select: ['originState'],
      });

      const regionCounts = {};
      let totalFreights = 0;

      freights.forEach((freight) => {
        if (freight.originState) {
          const uf = freight.originState.trim().toUpperCase();
          const region = stateToRegion[uf] || 'Outros';
          regionCounts[region] = (regionCounts[region] || 0) + 1;
          totalFreights++;
        }
      });

      const regionData = Object.entries(regionCounts)
        .map(([region, count]) => ({
          region,
          count: count as number,
          percentage: Math.round(((count as number) / totalFreights) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      return regionData;
    } catch (error) {
      console.error('Freights by Region Error:', error);
      throw new HttpException(
        'Failed to fetch freights by region',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTopDrivers(userId: string) {
    try {
      const topDrivers = await this.freightRoutesRepository
        .createQueryBuilder('route')
        .leftJoin('route.userDrive', 'userDrive')
        .select('userDrive.id', 'userId')
        .addSelect('userDrive.name', 'name')
        .addSelect('userDrive.photoFaceURL', 'photo')
        .addSelect('COUNT(route.id)', 'totalTrips')
        .where('route.companyId = :userId', { userId })
        .andWhere('route.status = :status', { status: RouteStatus.COMPLETED })
        .andWhere('userDrive.id IS NOT NULL')
        .groupBy('userDrive.id')
        .addGroupBy('userDrive.name')
        .addGroupBy('userDrive.photoFaceURL')
        .orderBy('"totalTrips"', 'DESC')
        .limit(3)
        .getRawMany();

      if (topDrivers.length === 0) {
        return [];
      }

      const driverIds = topDrivers.map((driver) => driver.userId);
      const allVehicles = await this.vehicleRepository
        .createQueryBuilder('vehicle')
        .select([
          'vehicle.id',
          'vehicle.vehicleType',
          'vehicle.bodyType',
          'vehicle.plateNumber',
          'vehicle.userId',
          'vehicle.isMainVehicle',
        ])
        .where('vehicle.userId IN (:...driverIds)', { driverIds })
        .getMany();

      const vehiclesByDriver = allVehicles.reduce(
        (acc, vehicle) => {
          if (!acc[vehicle.userId]) {
            acc[vehicle.userId] = [];
          }
          acc[vehicle.userId].push(vehicle);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      return topDrivers.map((driver) => ({
        userId: driver.userId,
        name: driver.name,
        photo: driver.photo,
        totalTrips: parseInt(driver.totalTrips),
        vehicles: vehiclesByDriver[driver.userId] || [],
      }));
    } catch (error) {
      console.error('Top Drivers Error:', error);
      throw new HttpException(
        'Failed to fetch top drivers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
