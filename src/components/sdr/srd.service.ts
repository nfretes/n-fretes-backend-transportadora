import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '@entities/company.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { Freight } from '@entities/freight.entity';
import { FreightRequest } from '@entities/freight-requests.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { Vehicle } from '@entities/vehicles.entity';
import { UsersLocation } from '@entities/users-location.entity';
import {
  SdrCompanyListResponseDto,
  SdrCompanyDto,
  SdrContactDto,
  SdrSubscriptionStatusDto,
} from './dto/sdr-company-list.dto';
import {
  SdrPostHistoryResponseDto,
  SdrFreightPostDto,
  SdrFreightRouteDto,
} from './dto/sdr-post-history.dto';
import {
  SdrMatchPerformanceResponseDto,
  SdrFreightMatchDto,
  SdrRequesterInfoDto,
} from './dto/sdr-match-performance.dto';
import {
  SdrDriverRetentionRiskResponseDto,
  SdrDriverRiskDto,
  SdrDriverVehicleDto,
} from './dto/sdr-driver-retention.dto';
import {
  SdrMarketHeatmapResponseDto,
  SdrRouteHeatmapDto,
} from './dto/sdr-market-heatmap.dto';
import {
  SdrDriverActivityListResponseDto,
  SdrDriverActivityDto,
  SdrDriverContactDto,
  SdrDriverVehicleSummaryDto,
} from './dto/sdr-driver-activity.dto';
import {
  SdrFirstFreightAnalysisResponseDto,
  SdrCompanyFirstFreightDto,
} from './dto/sdr-first-freight-analysis.dto';
import {
  SdrPostingFrequencyResponseDto,
  SdrCompanyPostingFrequencyDto,
  PostingPeriod,
} from './dto/sdr-posting-frequency.dto';

@Injectable()
export class SdrService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(ContactCompany)
    private readonly contactCompanyRepository: Repository<ContactCompany>,
    @InjectRepository(SubscriptionCompany)
    private readonly subscriptionCompanyRepository: Repository<SubscriptionCompany>,
    @InjectRepository(Freight)
    private readonly freightRepository: Repository<Freight>,
    @InjectRepository(FreightRequest)
    private readonly freightRequestRepository: Repository<FreightRequest>,
    @InjectRepository(UsersDrive)
    private readonly usersDriveRepository: Repository<UsersDrive>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(UsersLocation)
    private readonly usersLocationRepository: Repository<UsersLocation>,
  ) {}

  async listCompanies(
    page: number = 1,
    limit: number = 10,
  ): Promise<SdrCompanyListResponseDto> {
    const skip = (page - 1) * limit;

    const [companies, total] = await this.companyRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const data = await Promise.all(
      companies.map(async (company) => {
        const contacts = await this.contactCompanyRepository.find({
          where: { companyId: company.id, isActive: true },
          select: ['id', 'name', 'phoneNumber', 'isActive'],
        });

        const subscription = await this.subscriptionCompanyRepository.findOne({
          where: { companyId: company.id },
          relations: ['plan'],
        });

        return this.mapCompanyToDto(company, contacts, subscription);
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private mapCompanyToDto(
    company: Company,
    contacts: ContactCompany[],
    subscription: SubscriptionCompany | null,
  ): SdrCompanyDto {
    const contactsDto: SdrContactDto[] = contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      isActive: contact.isActive,
    }));

    const subscriptionDto: SdrSubscriptionStatusDto = this.mapSubscriptionToDto(
      subscription,
    );

    return {
      id: company.id,
      name: company.name,
      nameFantasy: company.nameFantasy,
      cnpj: company.cnpj,
      phoneNumber: company.phoneNumber,
      contacts: contactsDto,
      subscription: subscriptionDto,
      createdAt: company.createdAt,
      isActive: company.isActive,
      isCompleted: company.isCompleted,
    };
  }

  private mapSubscriptionToDto(
    subscription: SubscriptionCompany | null,
  ): SdrSubscriptionStatusDto {
    if (!subscription) {
      return {
        id: null,
        status: null,
        planName: null,
        nextRecurrency: null,
        endDate: null,
        isExpiringSoon: false,
        isInTrial: false,
        trialEndDate: null,
      };
    }

    const isExpiringSoon = this.checkIfExpiringSoon(
      subscription.nextRecurrency,
      subscription.endDate,
    );

    return {
      id: subscription.id,
      status: subscription.status,
      planName: subscription.plan?.name || null,
      nextRecurrency: subscription.nextRecurrency,
      endDate: subscription.endDate,
      isExpiringSoon,
      isInTrial: subscription.isInTrial,
      trialEndDate: subscription.trialEndDate,
    };
  }

  private checkIfExpiringSoon(
    nextRecurrency: string | null,
    endDate: string | null,
  ): boolean {
    const now = new Date();
    const daysToCheck = 7;

    if (nextRecurrency) {
      const nextDate = new Date(nextRecurrency);
      const diffTime = nextDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays <= daysToCheck && diffDays >= 0) {
        return true;
      }
    }

    if (endDate) {
      const expirationDate = new Date(endDate);
      const diffTime = expirationDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays <= daysToCheck && diffDays >= 0) {
        return true;
      }
    }

    return false;
  }

  async getCompanyPostHistory(
    companyId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SdrPostHistoryResponseDto> {
    const skip = (page - 1) * limit;

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      select: ['id', 'name', 'nameFantasy'],
    });

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    const [freights, total] = await this.freightRepository.findAndCount({
      where: { companyId },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const data = freights.map((freight) => this.mapFreightToDto(freight));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      companyId: company.id,
      companyName: company.name,
      companyFantasyName: company.nameFantasy,
    };
  }

  private mapFreightToDto(freight: Freight): SdrFreightPostDto {
    const route: SdrFreightRouteDto = {
      originCity: freight.originCity || null,
      originState: freight.originState || null,
      destinyCity: freight.destinyCity || null,
      destinyState: freight.destinyState || null,
      distance: freight.distance || null,
    };

    return {
      id: freight.id,
      route,
      vehicleTypes: freight.vehicleTypes || null,
      bodyTypes: freight.bodyTypes || null,
      dateOrigin: freight.dateOrigin || null,
      dateReceiver: freight.dateReceiver || null,
      typeOfLoad: freight.typeOfLoad || null,
      specieOfLoad: freight.specieOfLoad || null,
      product: freight.product || null,
      weightOfLoad: freight.weightOfLoad || null,
      valueFreight: freight.Valuefreight || null,
      createdAt: freight.createdAt,
      updatedAt: freight.updatedAt,
      isActive: freight.isActive,
      openSolicitations: freight.openSolicitations,
    };
  }

  async getMatchPerformance(
    companyId: string | undefined,
    page: number = 1,
    limit: number = 10,
  ): Promise<SdrMatchPerformanceResponseDto> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.freightRequestRepository
      .createQueryBuilder('freightRequest')
      .leftJoinAndSelect('freightRequest.freight', 'freight')
      .leftJoinAndSelect('freightRequest.company', 'company')
      .leftJoinAndSelect('freightRequest.userDrive', 'userDrive')
      .where('freightRequest.status = :status', { status: 'PENDING' });

    if (companyId) {
      queryBuilder.andWhere('freight.companyId = :companyId', { companyId });
    }

    queryBuilder
      .orderBy('freightRequest.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();

    const data = requests.map((request) =>
      this.mapFreightRequestToMatchDto(request),
    );

    const totalPages = Math.ceil(total / limit);

    const averageResponseTimeHours = this.calculateAverageResponseTime(data);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      averageResponseTimeHours,
    };
  }

  private mapFreightRequestToMatchDto(
    request: FreightRequest,
  ): SdrFreightMatchDto {
    const now = new Date();
    const requestDate = new Date(request.createdAt);
    const diffMs = now.getTime() - requestDate.getTime();
    const hoursWithoutResponse = Math.floor(diffMs / (1000 * 60 * 60));
    const daysWithoutResponse = Math.floor(hoursWithoutResponse / 24);

    const requester: SdrRequesterInfoDto = {
      id: request.userDrive?.id || '',
      name: request.userDrive?.name || null,
      cpf: request.userDrive?.cpf || null,
      phoneNumber: request.userDrive?.phoneNumber || null,
      email: request.userDrive?.email || null,
    };

    return {
      requestId: request.id,
      freightId: request.freight?.id || '',
      companyId: request.company?.id || '',
      companyName: request.company?.name || null,
      companyFantasyName: request.company?.nameFantasy || null,
      originCity: request.freight?.originCity || null,
      originState: request.freight?.originState || null,
      destinyCity: request.freight?.destinyCity || null,
      destinyState: request.freight?.destinyState || null,
      requestDate: request.createdAt,
      hoursWithoutResponse,
      daysWithoutResponse,
      requestStatus: request.status,
      requester,
      freightValue: request.freight?.Valuefreight || null,
      product: request.freight?.product || null,
      freightCreatedAt: request.freight?.createdAt || requestDate,
    };
  }

  private calculateAverageResponseTime(data: SdrFreightMatchDto[]): number {
    if (data.length === 0) return 0;

    const totalHours = data.reduce(
      (sum, item) => sum + item.hoursWithoutResponse,
      0,
    );

    return Math.round((totalHours / data.length) * 10) / 10;
  }

  async getDriverRetentionRisk(
    minDaysSinceSignup: number = 7,
    neverRequested: boolean = false,
    page: number = 1,
    limit: number = 10,
  ): Promise<SdrDriverRetentionRiskResponseDto> {
    const skip = (page - 1) * limit;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - minDaysSinceSignup);

    const queryBuilder = this.usersDriveRepository
      .createQueryBuilder('driver')
      .where('driver.createdAt <= :cutoffDate', { cutoffDate });

    const drivers = await queryBuilder.getMany();

    const driversWithData = await Promise.all(
      drivers.map(async (driver) => {
        const vehicles = await this.vehicleRepository.find({
          where: { userId: driver.id },
          order: { isMainVehicle: 'DESC', createdAt: 'DESC' },
        });

        const requests = await this.freightRequestRepository.find({
          where: { userDriveId: driver.id },
          order: { createdAt: 'DESC' },
          take: 1,
        });

        const totalRequests = await this.freightRequestRepository.count({
          where: { userDriveId: driver.id },
        });

        return {
          driver,
          vehicles,
          totalRequests,
          lastRequest: requests[0] || null,
        };
      }),
    );

    let filteredDrivers = driversWithData;

    if (neverRequested) {
      filteredDrivers = filteredDrivers.filter(
        (item) => item.totalRequests === 0,
      );
    }

    filteredDrivers.sort((a, b) => {
      const aDate = a.driver.createdAt.getTime();
      const bDate = b.driver.createdAt.getTime();
      return aDate - bDate;
    });

    const total = filteredDrivers.length;
    const paginatedDrivers = filteredDrivers.slice(skip, skip + limit);

    const data = paginatedDrivers.map((item) =>
      this.mapDriverToRiskDto(
        item.driver,
        item.vehicles,
        item.totalRequests,
        item.lastRequest,
      ),
    );

    const statistics = this.calculateDriverStatistics(
      filteredDrivers.map((item) =>
        this.mapDriverToRiskDto(
          item.driver,
          item.vehicles,
          item.totalRequests,
          item.lastRequest,
        ),
      ),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      highRiskCount: statistics.highRisk,
      mediumRiskCount: statistics.mediumRisk,
      lowRiskCount: statistics.lowRisk,
      neverRequestedCount: statistics.neverRequested,
      averageDaysSinceSignup: statistics.averageDaysSinceSignup,
    };
  }

  private mapDriverToRiskDto(
    driver: UsersDrive,
    vehicles: Vehicle[],
    totalRequests: number,
    lastRequest: FreightRequest | null,
  ): SdrDriverRiskDto {
    const now = new Date();
    const signupDate = new Date(driver.createdAt);
    const diffMs = now.getTime() - signupDate.getTime();
    const daysSinceSignup = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const vehiclesDto: SdrDriverVehicleDto[] = vehicles.map((vehicle) => ({
      id: vehicle.id,
      vehicleType: vehicle.vehicleType || null,
      bodyType: vehicle.bodyType || null,
      plateNumber: vehicle.plateNumber || null,
      plateState: vehicle.plateState || null,
      isMainVehicle: vehicle.isMainVehicle,
    }));

    const neverRequested = totalRequests === 0;
    const riskLevel = this.calculateRiskLevel(
      daysSinceSignup,
      neverRequested,
      lastRequest,
    );

    return {
      id: driver.id,
      name: driver.name || null,
      cpf: driver.cpf || null,
      phoneNumber: driver.phoneNumber || null,
      email: driver.email || null,
      signupDate: driver.createdAt,
      daysSinceSignup,
      vehicles: vehiclesDto,
      totalRequests,
      neverRequested,
      lastActivityDate: lastRequest ? lastRequest.createdAt : null,
      riskLevel,
    };
  }

  private calculateRiskLevel(
    daysSinceSignup: number,
    neverRequested: boolean,
    lastRequest: FreightRequest | null,
  ): string {
    if (neverRequested && daysSinceSignup > 30) {
      return 'ALTO';
    }

    if (neverRequested && daysSinceSignup > 15) {
      return 'MÉDIO';
    }

    if (lastRequest) {
      const now = new Date();
      const lastActivityDate = new Date(lastRequest.createdAt);
      const daysSinceActivity = Math.floor(
        (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceActivity > 30) {
        return 'ALTO';
      }

      if (daysSinceActivity > 15) {
        return 'MÉDIO';
      }
    }

    return 'BAIXO';
  }

  private calculateDriverStatistics(drivers: SdrDriverRiskDto[]): {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    neverRequested: number;
    averageDaysSinceSignup: number;
  } {
    const highRisk = drivers.filter((d) => d.riskLevel === 'ALTO').length;
    const mediumRisk = drivers.filter((d) => d.riskLevel === 'MÉDIO').length;
    const lowRisk = drivers.filter((d) => d.riskLevel === 'BAIXO').length;
    const neverRequested = drivers.filter((d) => d.neverRequested).length;

    const totalDays = drivers.reduce((sum, d) => sum + d.daysSinceSignup, 0);
    const averageDaysSinceSignup =
      drivers.length > 0 ? Math.round(totalDays / drivers.length) : 0;

    return {
      highRisk,
      mediumRisk,
      lowRisk,
      neverRequested,
      averageDaysSinceSignup,
    };
  }

 
  async getMarketHeatmap(
    page: number = 1,
    limit: number = 50,
  ): Promise<SdrMarketHeatmapResponseDto> {
    const skip = (page - 1) * limit;

    // Buscar fretes com suas rotas (ordenados por data de criação)
    const [freights, total] = await this.freightRepository.findAndCount({
      relations: ['company'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

   
    const routeHeatmapPromises = freights.map(async (freight) => {

      const driversNearOrigin = await this.usersLocationRepository.count({
        where: {
          city: freight.originCity,
        },
      });


      const driversNearDestiny = await this.usersLocationRepository.count({
        where: {
          city: freight.destinyCity,
        },
      });


      const totalDriversInRoute = driversNearOrigin + driversNearDestiny;

      let opportunityLevel: 'ALTO' | 'MÉDIO' | 'BAIXO';
      if (totalDriversInRoute > 15) {
        opportunityLevel = 'ALTO';
      } else if (totalDriversInRoute >= 5) {
        opportunityLevel = 'MÉDIO';
      } else {
        opportunityLevel = 'BAIXO';
      }

      const routeHeatmap: SdrRouteHeatmapDto = {
        freightId: freight.id,
        originCity: freight.originCity,
        originState: freight.originState,
        destinyCity: freight.destinyCity,
        destinyState: freight.destinyState,
        driversNearOrigin,
        driversNearDestiny,
        totalDriversInRoute,
        opportunityLevel,
        companyName: freight.company?.name || null,
        companyFantasyName: freight.company?.nameFantasy || null,
        freightValue: freight.Valuefreight || null,
        product: freight.product || null,
        freightCreatedAt: freight.createdAt,
      };

      return routeHeatmap;
    });

    const data = await Promise.all(routeHeatmapPromises);

    data.sort((a, b) => b.totalDriversInRoute - a.totalDriversInRoute);

    // Calcular estatísticas
    const totalPages = Math.ceil(total / limit);
    const highOpportunityRoutes = data.filter(
      (r) => r.opportunityLevel === 'ALTO',
    ).length;
    const mediumOpportunityRoutes = data.filter(
      (r) => r.opportunityLevel === 'MÉDIO',
    ).length;
    const lowOpportunityRoutes = data.filter(
      (r) => r.opportunityLevel === 'BAIXO',
    ).length;

    const totalDriversCounted = data.reduce(
      (sum, r) => sum + r.totalDriversInRoute,
      0,
    );
    const averageDriversPerRoute =
      data.length > 0 ? Math.round(totalDriversCounted / data.length) : 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      averageDriversPerRoute,
    };
  }

  async getDriverActivityList(
    page: number = 1,
    limit: number = 50,
  ): Promise<SdrDriverActivityListResponseDto> {
    const skip = (page - 1) * limit;

    const [drivers, total] = await this.usersDriveRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const driverActivityPromises = drivers.map(async (driver) => {
      // Buscar primeira requisição de frete (data de ativação)
      const firstRequest = await this.freightRequestRepository.findOne({
        where: { userDriveId: driver.id },
        order: { createdAt: 'ASC' },
      });

      const activationDate = firstRequest ? firstRequest.createdAt : null;
      const isActivated = !!activationDate;

      let daysToActivation: number | null = null;
      if (activationDate) {
        const signupDate = new Date(driver.createdAt);
        const activDate = new Date(activationDate);
        const diffMs = activDate.getTime() - signupDate.getTime();
        daysToActivation = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

  
      const totalRequests = await this.freightRequestRepository.count({
        where: { userDriveId: driver.id },
      });

      const vehicle = await this.vehicleRepository.findOne({
        where: { userId: driver.id },
        order: { createdAt: 'ASC' },
      });

      const vehicleSummary: SdrDriverVehicleSummaryDto | null = vehicle
        ? {
            vehicleType: vehicle.vehicleType || null,
            plateNumber: vehicle.plateNumber || null,
          }
        : null;

 
      const lastLocation = await this.usersLocationRepository.findOne({
        where: { userId: driver.id },
        order: { updatedAt: 'DESC' },
      });

      // Meios de contato
      const contact: SdrDriverContactDto = {
        phoneNumber: driver.phoneNumber || null,
        email: driver.email || null,
        hasPhone: !!driver.phoneNumber,
        hasEmail: !!driver.email,
      };

    
      let engagementStatus: 'ATIVO' | 'INATIVO' | 'NOVO' | 'NÃO ATIVADO';
      const now = new Date();
      const signupDate = new Date(driver.createdAt);
      const daysSinceSignup = Math.floor(
        (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (!isActivated) {
        engagementStatus = 'NÃO ATIVADO';
      } else if (daysSinceSignup < 7) {
        engagementStatus = 'NOVO';
      } else if (activationDate) {
        const daysSinceActivation = Math.floor(
          (now.getTime() - new Date(activationDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysSinceActivation > 30) {
          engagementStatus = 'INATIVO';
        } else {
          engagementStatus = 'ATIVO';
        }
      } else {
        engagementStatus = 'INATIVO';
      }

      const driverActivity: SdrDriverActivityDto = {
        id: driver.id,
        name: driver.name || null,
        cpf: driver.cpf || null,
        signupDate: driver.createdAt,
        activationDate,
        daysToActivation,
        isActivated,
        totalRequests,
        vehicle: vehicleSummary,
        contact,
        lastKnownCity: lastLocation?.city || null,
        lastActivityDate: activationDate,
        engagementStatus,
      };

      return driverActivity;
    });

    const data = await Promise.all(driverActivityPromises);

 
    const totalPages = Math.ceil(total / limit);
    const totalActivated = data.filter((d) => d.isActivated).length;
    const activationRate =
      total > 0 ? Math.round((totalActivated / total) * 100) : 0;

    const activatedDrivers = data.filter(
      (d) => d.daysToActivation !== null,
    ) as Array<SdrDriverActivityDto & { daysToActivation: number }>;
    const totalDaysToActivation = activatedDrivers.reduce(
      (sum, d) => sum + d.daysToActivation,
      0,
    );
    const averageDaysToActivation =
      activatedDrivers.length > 0
        ? Math.round(totalDaysToActivation / activatedDrivers.length)
        : 0;

    const totalNotActivated = total - totalActivated;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      totalActivated,
      totalNotActivated,
      activationRate,
      averageDaysToActivation,
    };
  }

  async getFirstFreightAnalysis(
    page: number = 1,
    limit: number = 50,
    companyId?: string,
  ): Promise<SdrFirstFreightAnalysisResponseDto> {
    const skip = (page - 1) * limit;

    let whereCondition = {};
    if (companyId) {
      whereCondition = { id: companyId };
    }

    const [companies, total] = await this.companyRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const companyAnalysisPromises = companies.map(async (company) => {
      const firstFreight = await this.freightRepository.findOne({
        where: { companyId: company.id },
        order: { createdAt: 'ASC' },
      });

      const firstFreightDate = firstFreight ? firstFreight.createdAt : null;
      const hasPublished = !!firstFreightDate;

      let daysToFirstFreight: number | null = null;
      if (firstFreightDate) {
        const signupDate = new Date(company.createdAt);
        const freightDate = new Date(firstFreightDate);
        const diffMs = freightDate.getTime() - signupDate.getTime();
        daysToFirstFreight = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

      const totalFreights = await this.freightRepository.count({
        where: { companyId: company.id },
      });

      const contacts = await this.contactCompanyRepository.find({
        where: { companyId: company.id },
        take: 1,
      });
      const contact = contacts[0];

      let engagementSpeed: 'RÁPIDO' | 'MÉDIO' | 'LENTO' | 'NÃO PUBLICOU';
      if (!hasPublished) {
        engagementSpeed = 'NÃO PUBLICOU';
      } else if (daysToFirstFreight !== null) {
        if (daysToFirstFreight < 3) {
          engagementSpeed = 'RÁPIDO';
        } else if (daysToFirstFreight <= 7) {
          engagementSpeed = 'MÉDIO';
        } else {
          engagementSpeed = 'LENTO';
        }
      } else {
        engagementSpeed = 'NÃO PUBLICOU';
      }

      const companyFirstFreight: SdrCompanyFirstFreightDto = {
        companyId: company.id,
        companyName: company.name || null,
        companyFantasyName: company.nameFantasy || null,
        signupDate: company.createdAt,
        firstFreightDate,
        daysToFirstFreight,
        hasPublished,
        totalFreights,
        phoneNumber: contact?.phoneNumber || null,
        email: contact?.email || null,
        engagementSpeed,
      };

      return companyFirstFreight;
    });

    const data = await Promise.all(companyAnalysisPromises);

    const totalPages = Math.ceil(total / limit);

    const companiesNotPublished = data.filter((c) => !c.hasPublished).length;
    const fastEngagement = data.filter(
      (c) => c.engagementSpeed === 'RÁPIDO',
    ).length;
    const mediumEngagement = data.filter(
      (c) => c.engagementSpeed === 'MÉDIO',
    ).length;
    const slowEngagement = data.filter(
      (c) => c.engagementSpeed === 'LENTO',
    ).length;

    const publishedCompanies = data.filter(
      (c) => c.daysToFirstFreight !== null,
    ) as Array<SdrCompanyFirstFreightDto & { daysToFirstFreight: number }>;
    const totalDays = publishedCompanies.reduce(
      (sum, c) => sum + c.daysToFirstFreight,
      0,
    );
    const averageDaysToFirstFreight =
      publishedCompanies.length > 0
        ? Math.round(totalDays / publishedCompanies.length)
        : 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      averageDaysToFirstFreight,
      companiesNotPublished,
      fastEngagement,
      mediumEngagement,
      slowEngagement,
    };
  }

  async getPostingFrequency(
    page: number = 1,
    limit: number = 50,
    period: PostingPeriod = PostingPeriod.WEEKLY,
    companyId?: string,
  ): Promise<SdrPostingFrequencyResponseDto> {
    const skip = (page - 1) * limit;

    let whereCondition = {};
    if (companyId) {
      whereCondition = { id: companyId };
    }

    const [companies, total] = await this.companyRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const companyFrequencyPromises = companies.map(async (company) => {
      const freights = await this.freightRepository.find({
        where: { companyId: company.id },
        order: { createdAt: 'ASC' },
      });

      const totalFreights = freights.length;
      const firstFreightDate = freights[0]?.createdAt || null;
      const lastFreightDate = freights[freights.length - 1]?.createdAt || null;

      let activeDays = 0;
      let averagePerDay = 0;
      let averagePerWeek = 0;
      let averagePerMonth = 0;

      if (firstFreightDate && lastFreightDate) {
        const diffMs =
          new Date(lastFreightDate).getTime() -
          new Date(firstFreightDate).getTime();
        activeDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        averagePerDay = totalFreights / activeDays;
        averagePerWeek = (totalFreights / activeDays) * 7;
        averagePerMonth = (totalFreights / activeDays) * 30;
      }

      const contacts = await this.contactCompanyRepository.find({
        where: { companyId: company.id },
        take: 1,
      });
      const contact = contacts[0];

      let activityLevel: 'ALTO' | 'MÉDIO' | 'BAIXO' | 'INATIVO';
      if (totalFreights === 0) {
        activityLevel = 'INATIVO';
      } else if (averagePerWeek > 10) {
        activityLevel = 'ALTO';
      } else if (averagePerWeek >= 3) {
        activityLevel = 'MÉDIO';
      } else {
        activityLevel = 'BAIXO';
      }

      const companyFrequency: SdrCompanyPostingFrequencyDto = {
        companyId: company.id,
        companyName: company.name || null,
        companyFantasyName: company.nameFantasy || null,
        totalFreights,
        averagePerDay: parseFloat(averagePerDay.toFixed(2)),
        averagePerWeek: parseFloat(averagePerWeek.toFixed(2)),
        averagePerMonth: parseFloat(averagePerMonth.toFixed(2)),
        firstFreightDate,
        lastFreightDate,
        activeDays,
        phoneNumber: contact?.phoneNumber || null,
        email: contact?.email || null,
        activityLevel,
      };

      return companyFrequency;
    });

    const data = await Promise.all(companyFrequencyPromises);

    const totalPages = Math.ceil(total / limit);

    const totalFreightsAllCompanies = data.reduce(
      (sum, c) => sum + c.totalFreights,
      0,
    );
    const totalActiveDays = data.reduce((sum, c) => sum + c.activeDays, 0);

    const overallAveragePerDay =
      totalActiveDays > 0
        ? parseFloat(
            (totalFreightsAllCompanies / totalActiveDays).toFixed(2),
          )
        : 0;
    const overallAveragePerWeek = parseFloat(
      (overallAveragePerDay * 7).toFixed(2),
    );
    const overallAveragePerMonth = parseFloat(
      (overallAveragePerDay * 30).toFixed(2),
    );

    const highActivity = data.filter((c) => c.activityLevel === 'ALTO').length;
    const mediumActivity = data.filter(
      (c) => c.activityLevel === 'MÉDIO',
    ).length;
    const lowActivity = data.filter((c) => c.activityLevel === 'BAIXO').length;
    const inactive = data.filter((c) => c.activityLevel === 'INATIVO').length;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      totalFreightsAllCompanies,
      overallAveragePerDay,
      overallAveragePerWeek,
      overallAveragePerMonth,
      highActivity,
      mediumActivity,
      lowActivity,
      inactive,
    };
  }
}
