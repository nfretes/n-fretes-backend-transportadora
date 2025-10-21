import { Freight } from '@entities/freight.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateFreightDto, UpdateFreightDto } from './dto/freight.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseFreightDto } from './dto/response-freight.dto';
import { Company } from '@entities/company.entity';
import { ParamsFreight } from './interface/IFreight';
import { PaginationService } from '@components/pagination/pagination.service';
import { UsersDrive } from '@entities/users-drive.entity';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { FeatureUsage } from '@entities/feature-usage.entity';
import { SQSService } from '@components/sqs/sqs.service';
import { FeatureLog } from '@entities/feature-logs.entity';
import { FreightIsFeatured, SharingFreightDto } from './dto/sharing.dto';
import { DistanceService } from '@components/distance/distance.service';

export class FreightService {
  constructor(
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(UsersDrive)
    private userDriveRepository: Repository<UsersDrive>,
    @InjectRepository(SubscriptionCompany)
    private subscriptionCompanyRepository: Repository<SubscriptionCompany>,
    @InjectRepository(FeatureUsage)
    private featureUsageRepository: Repository<FeatureUsage>,
    @InjectRepository(FeatureLog)
    private featureLogsRepository: Repository<FeatureLog>,
    private readonly paginationService: PaginationService,
    private readonly sqsService: SQSService,
    private readonly distanceService: DistanceService,
  ) {}

  /****************************************CREATE FREIGHT****************************************** */
  async createFreightCompany(
    createFreightDto: CreateFreightDto,
    userId: string,
  ): Promise<CreateFreightDto> {
    console.log(
      createFreightDto,
      'Retorno do que esta vindo nos parametros de crição',
    );
    try {
      const data = {
        ...createFreightDto,
        companyId: userId,
      };

      console.log(data, 'Retorno do data');

      if (
        data.originLatitude &&
        data.originLongitude &&
        data.destinyLatitude &&
        data.destinyLongitude
      ) {
        try {
          const distanceData = await this.distanceService.calculateRoadDistance(
            Number(data.originLatitude),
            Number(data.originLongitude),
            Number(data.destinyLatitude),
            Number(data.destinyLongitude),
          );

          data.distance = distanceData.distance.toString();
        } catch (error) {
          console.error(
            'Erro ao calcular distância rodoviária na criação:',
            error,
          );
        }
      }

      const create = this.freightRepository.create(data);
      const save = await this.freightRepository.save(create);

      return save;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao criar o frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /****************************************FIND FREIGHT COUNT****************************************** */
  async freightCountCompany(userId: string): Promise<any> {
    try {
      const totalCount = await this.freightRepository.count({
        where: {
          companyId: userId,
          isActive: true,
          openSolicitations: true,
          isExclude: false,
        },
      });

      return {
        count: totalCount,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao contar os fretes da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /****************************************EDIT FREIGHT****************************************** */
  async editFreight(
    update: UpdateFreightDto,
    id: string,
  ): Promise<UpdateFreightDto> {
    try {
      const freight = await this.freightRepository.findOne({ where: { id } });

      if (!freight) {
        throw new HttpException('Frete não encontrado', HttpStatus.NOT_FOUND);
      }

      await this.freightRepository.update(freight.id, update);
      const updatedFreight = await this.freightRepository.findOne({
        where: { id },
      });
      return updatedFreight;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao atualizar o frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /****************************************SUGEST DRIVE****************************************** */
  async getSuggestedDrivers(params: ParamsFreight) {
    const { page = 1, take = 10, id } = params;

    const freight = await this.freightRepository.findOne({ where: { id } });

    if (!freight) {
      throw new HttpException('Frete não encontrado', HttpStatus.NOT_FOUND);
    }

    const offset = (page - 1) * take;
    const originLat = Number(freight.originLatitude);
    const originLng = Number(freight.originLongitude);
    const radiusInKm = 50;

    const driversQuery = await this.userDriveRepository
      .createQueryBuilder('users_drive')
      .innerJoinAndSelect('users_drive.locations', 'location')
      .innerJoinAndSelect('users_drive.vehicles', 'vehicles')
      .addSelect(
        `
        6371 * acos(
          cos(radians(:originLat)) * cos(radians(location.latitude)) * 
          cos(radians(location.longitude) - radians(:originLng)) + 
          sin(radians(:originLat)) * sin(radians(location.latitude))
        )
      `,
        'haversine_distance',
      )
      .where('users_drive.isOnRoute = :isOnRoute', { isOnRoute: false })
      .andWhere(
        `
        6371 * acos(
          cos(radians(:originLat)) * cos(radians(location.latitude)) * 
          cos(radians(location.longitude) - radians(:originLng)) + 
          sin(radians(:originLat)) * sin(radians(location.latitude))
        ) <= :radiusInKm
      `,
      )
      .setParameters({
        originLat,
        originLng,
        radiusInKm: radiusInKm * 1.5,
      })
      .orderBy('haversine_distance', 'ASC')
      .limit(take * 3)
      .getMany();

    const driversWithRoadDistance =
      await this.distanceService.findNearbyDriversWithRoadDistance(
        originLat,
        originLng,
        driversQuery,
        radiusInKm,
      );

    const total = driversWithRoadDistance.length;
    const paginatedDrivers = driversWithRoadDistance.slice(
      offset,
      offset + take,
    );

    return {
      data: paginatedDrivers,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / take),
    };
  }
  /****************************************GET CONTACT ID****************************************** */
  async getContactId(id: string): Promise<ResponseFreightDto> {
    try {
      const freight = await this.freightRepository.findOne({
        where: { id },
      });

      if (!freight) {
        throw new HttpException(
          'Não foi localizado esse frete',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        freight.originLatitude &&
        freight.originLongitude &&
        freight.destinyLatitude &&
        freight.destinyLongitude
      ) {
        try {
          const distanceData = await this.distanceService.calculateRoadDistance(
            Number(freight.originLatitude),
            Number(freight.originLongitude),
            Number(freight.destinyLatitude),
            Number(freight.destinyLongitude),
          );

          return {
            ...freight,
            roadDistance: distanceData.distance,
            estimatedDuration: distanceData.duration,
            distanceStatus: distanceData.status,
          } as any;
        } catch (error) {
          console.error('Erro ao calcular distância do frete:', error);
          return freight;
        }
      }

      return freight;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar o localizado espéfico',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /****************************************ALL FREIGHT USERID****************************************** */

  async getFreightsAll(params: ParamsFreight, userId: string): Promise<any> {
    try {
      const queryBuilder = this.freightRepository.createQueryBuilder('freight');
      const companyId = userId;
      const { take, page } =
        this.paginationService.getDefaultPaginationParams(params);

      const hasActiveSubscription = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoin('company.subscription', 'subscription')
        .where('company.id = :companyId', { companyId })
        .andWhere('subscription.status = 1')
        .getOne();

      const maxFreights = hasActiveSubscription ? take : 3;

      const now = new Date();
      now.setHours(now.getHours() - 3);

      // Excluir fretes marcados como excluídos por padrão
      queryBuilder.where('freight.isExclude = false');

      if (params.id) {
        queryBuilder.andWhere('freight.id = :id', { id: params.id });
      }

      if (params.originCity) {
        const originCities = this.ensureArray(params.originCity);
        queryBuilder.andWhere('freight.originCity IN (:...originCity)', {
          originCity: originCities,
        });
      }

      if (params.destinyCity) {
        const destinyCities = this.ensureArray(params.destinyCity);
        queryBuilder.andWhere('freight.destinyCity IN (:...destinyCity)', {
          destinyCity: destinyCities,
        });
      }

      if (params.vehicleTypes) {
        const vehicleTypesArray = this.ensureArray(params.vehicleTypes);
        if (vehicleTypesArray.length > 1) {
          const vehicleConditions = vehicleTypesArray.map(
            (_, index) =>
              `unaccent(LOWER(freight.vehicleTypes)) ILIKE unaccent(LOWER(:vehicleType${index}))`,
          );
          queryBuilder.andWhere(
            `(${vehicleConditions.join(' OR ')})`,
            Object.fromEntries(
              vehicleTypesArray.map((v, i) => [`vehicleType${i}`, `%${v}%`]),
            ),
          );
        } else {
          const vehicleTypesFormatted = `%${vehicleTypesArray[0]}%`;
          queryBuilder.andWhere(
            `unaccent(LOWER(freight.vehicleTypes)) ILIKE unaccent(LOWER(:vehicleTypes))`,
            { vehicleTypes: vehicleTypesFormatted },
          );
        }
      }

      if (params.bodyTypes) {
        const bodyTypesArray = this.ensureArray(params.bodyTypes);
        if (bodyTypesArray.length > 1) {
          const bodyConditions = bodyTypesArray.map(
            (_, index) =>
              `unaccent(LOWER(freight.bodyTypes)) ILIKE unaccent(LOWER(:bodyType${index}))`,
          );
          queryBuilder.andWhere(
            `(${bodyConditions.join(' OR ')})`,
            Object.fromEntries(
              bodyTypesArray.map((v, i) => [`bodyType${i}`, `%${v}%`]),
            ),
          );
        } else {
          const bodyTypesFormatted = `%${bodyTypesArray[0]}%`;
          queryBuilder.andWhere(
            `unaccent(LOWER(freight.bodyTypes)) ILIKE unaccent(LOWER(:bodyTypes))`,
            { bodyTypes: bodyTypesFormatted },
          );
        }
      }

      const likeFilters = {
        typeOfLoad: `freight.typeOfLoad = :typeOfLoad`,
        specieOfLoad: `freight.specieOfLoad = :specieOfLoad`,

        product: `unaccent(LOWER(freight.product)) ILIKE unaccent(LOWER(:product))`,
      };

      const exactFilters = {
        isActive: `freight.isActive = :isActive`,
        openSolicitations: `freight.openSolicitations = :openSolicitations`,
        isExclude: `freight.isExclude = :isExclude`,
      };

      const dateFilters = {
        dateOrigin: `freight.dateOrigin = :dateOrigin`,
        dateReceiver: `freight.dateReceiver = :dateReceiver`,
        createdAt: `freight.createdAt = :createdAt`,
      };

      Object.entries(likeFilters).forEach(([key, condition]) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ''
        ) {
          if (Array.isArray(params[key])) {
            queryBuilder.andWhere(`freight.${key} IN (:...${key})`, {
              [key]: params[key],
            });
          } else {
            queryBuilder.andWhere(
              `unaccent(LOWER(freight.${key})) ILIKE unaccent(LOWER(:${key}))`,
              { [key]: `%${params[key]}%` },
            );
          }
        }
      });

      Object.entries(exactFilters).forEach(([key, condition]) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryBuilder.andWhere(condition, { [key]: params[key] });
        }
      });

      Object.entries(dateFilters).forEach(([key, condition]) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ''
        ) {
          queryBuilder.andWhere(condition, { [key]: params[key] });
        }
      });

      queryBuilder
        .leftJoinAndSelect('freight.contactCompany', 'contactCompany')
        .leftJoin(
          'freight.freightRequest',
          'freightRequest',
          'freightRequest.status = :status',
          { status: 'PENDING' },
        )
        .addSelect(['freightRequest.id', 'freightRequest.status'])
        .leftJoin('freight.company', 'company')
        .addSelect([
          'company.id',
          'company.name',
          'company.photoUrl',
          'company.phoneNumber',
          'company.createdAt',
          'company.city',
        ])
        .leftJoin('company.subscription', 'subscription-company')
        .addSelect('subscription-company.status')
        .addSelect(
          'CASE WHEN subscription-company.status = 1 THEN 0 ELSE 1 END',
          'status_priority',
        )
        .addSelect(
          `
          CASE 
            WHEN freight.isFeatured = true AND freight.expiresAt > :now THEN 0
            ELSE 1
          END
        `,
          'featured_priority',
        )
        .setParameter('now', now)
        .addOrderBy('featured_priority', 'ASC')
        .addOrderBy('status_priority', 'ASC')
        .addOrderBy('freight.createdAt', 'DESC');

      const [result, total] = await queryBuilder
        .skip((page - 1) * maxFreights)
        .take(maxFreights)
        .getManyAndCount();

      const regions = {
        origin: {
          norte: new Set<string>(),
          nordeste: new Set<string>(),
          centroOeste: new Set<string>(),
          sudeste: new Set<string>(),
          sul: new Set<string>(),
        },
        destiny: {
          norte: new Set<string>(),
          nordeste: new Set<string>(),
          centroOeste: new Set<string>(),
          sudeste: new Set<string>(),
          sul: new Set<string>(),
        },
      };

      result.forEach((freight) => {
        this.classifyCity(
          freight.originState,
          `${freight.originCity}`,
          regions.origin,
        );
        this.classifyCity(
          freight.destinyState,
          `${freight.destinyCity}`,
          regions.destiny,
        );
      });

      const formatRegions = (data: Record<string, Set<string>>) => {
        return Object.entries(data)
          .filter(([_, cities]) => cities.size > 0)
          .reduce((acc, [region, cities]) => {
            acc[region] = Array.from(cities);
            return acc;
          }, {});
      };

      return {
        data: result,
        count: total,
        origin: formatRegions(regions.origin),
        destiny: formatRegions(regions.destiny),
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar fretes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFreightsByTransporter(params: ParamsFreight): Promise<any> {
    try {
      const queryBuilder = this.freightRepository.createQueryBuilder('freight');

      // Excluir fretes marcados como excluídos
      queryBuilder.where('freight.isExclude = false');

      const { take, page } =
        this.paginationService.getDefaultPaginationParams(params);

      const filters = {
        originCity: `(unaccent(LOWER(freight.originCity)) ILIKE unaccent(LOWER(:originCity)))`,
        destinyCity: `(unaccent(LOWER(freight.destinyCity)) ILIKE unaccent(LOWER(:destinyCity)))`,
        isActive: `freight.isActive = :isActive`,
        dateOrigin: `freight.dateOrigin = :dateOrigin`,
        dateReceiver: `freight.dateReceiver = :dateReceiver`,
        typeOfLoad: `freight.typeOfLoad = :typeOfLoad`,
        specieOfLoad: `freight.specieOfLoad = :specieOfLoad`,
        vehicleTypes: `freight.vehicleTypes = :vehicleTypes`,
        bodyTypes: `freight.bodyTypes = :bodyTypes`,
        openSolicitations: `freight.openSolicitations = :openSolicitations`,
        createdAt: `freight.createdAt = :createdAt`,
      };

      Object.entries(filters).forEach(([key, condition]) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryBuilder.andWhere(condition, { [key]: `%${params[key]}%` });
        }
      });

      const [result, total] = await queryBuilder
        .leftJoinAndSelect('freight.company', 'company')
        .leftJoin('company.subscription', 'subscription-company')
        .addSelect('subscription-company.status')
        .addSelect(
          'CASE WHEN subscription-company.status = 1 THEN 0 ELSE 1 END',
          'status_priority',
        )
        .addOrderBy('status_priority', 'ASC')
        .addOrderBy('freight.createdAt', 'DESC')

        .skip((page - 1) * take)
        .take(take)
        .getManyAndCount();

      return {
        data: result,
        count: total,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar fretes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private ensureArray(value: any): any[] {
    if (typeof value === 'string') {
      // Decodifica caracteres URL e divide por vírgula se necessário
      const decodedValue = decodeURIComponent(value);
      if (decodedValue.includes(',')) {
        return decodedValue
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '');
      }
      try {
        return JSON.parse(value);
      } catch (error) {
        return [value];
      }
    }
    return Array.isArray(value) ? value : [value];
  }
  /****************************************GET FREIGHT USERID****************************************** */

  async getFreightsByUserId(
    params: ParamsFreight,
    userId: string,
  ): Promise<any> {
    try {
      const queryBuilder = this.freightRepository.createQueryBuilder('freight');
      const companyId = userId;
      const { take, page } =
        this.paginationService.getDefaultPaginationParams(params);

      const likeFilters = {
        typeOfLoad: `freight.typeOfLoad = :typeOfLoad`,
        specieOfLoad: `freight.specieOfLoad = :specieOfLoad`,
        vehicleTypes: `freight.vehicleTypes = :vehicleTypes`,
        bodyTypes: `freight.bodyTypes = :bodyTypes`,
        product: `unaccent(LOWER(freight.product)) ILIKE unaccent(LOWER(:product))`,
      };

      const exactFilters = {
        isActive: `freight.isActive = :isActive`,
        openSolicitations: `freight.openSolicitations = :openSolicitations`,
        isExclude: `freight.isExclude = :isExclude`,
      };

      const dateFilters = {
        dateOrigin: `freight.dateOrigin = :dateOrigin`,
        dateReceiver: `freight.dateReceiver = :dateReceiver`,
        createdAt: `freight.createdAt = :createdAt`,
      };

      queryBuilder.where('freight.companyId = :companyId', { companyId });

      // Excluir fretes marcados como excluídos
      queryBuilder.andWhere('freight.isExclude = false');

      if (params.originCity) {
        const originCities = this.ensureArray(params.originCity);
        queryBuilder.andWhere('freight.originCity IN (:...originCity)', {
          originCity: originCities,
        });
      }

      if (params.destinyCity) {
        const destinyCities = this.ensureArray(params.destinyCity);
        queryBuilder.andWhere('freight.destinyCity IN (:...destinyCity)', {
          destinyCity: destinyCities,
        });
      }

      Object.entries(likeFilters).forEach(([key, condition]) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ''
        ) {
          if (Array.isArray(params[key])) {
            queryBuilder.andWhere(`freight.${key} IN (:...${key})`, {
              [key]: params[key],
            });
          } else {
            queryBuilder.andWhere(
              `unaccent(LOWER(freight.${key})) ILIKE unaccent(LOWER(:${key}))`,
              { [key]: `%${params[key]}%` },
            );
          }
        }
      });

      Object.entries(exactFilters).forEach(([key, condition]) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryBuilder.andWhere(condition, { [key]: params[key] });
        }
      });

      Object.entries(dateFilters).forEach(([key, condition]) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ''
        ) {
          queryBuilder.andWhere(condition, { [key]: params[key] });
        }
      });

      const [result, total] = await queryBuilder
        .orderBy('freight.createdAt', 'DESC')
        .leftJoinAndSelect('freight.contactCompany', 'contactCompany')
        .leftJoin(
          'freight.freightRequest',
          'freightRequest',
          'freightRequest.status = :status',
          { status: 'PENDING' },
        )
        .addSelect(['freightRequest.id', 'freightRequest.status'])
        .skip((page - 1) * take)
        .take(take)
        .getManyAndCount();

      const inactiveFreightsCount = await this.freightRepository
        .createQueryBuilder('freight')
        .leftJoinAndSelect('freight.contactCompany', 'contactCompany')
        .where('freight.companyId = :companyId', { companyId })
        .andWhere('freight.isActive = :isActive', { isActive: false })
        .andWhere('freight.openSolicitations = :openSolicitations', {
          openSolicitations: false,
        })
        .andWhere('freight.isExclude = false')
        .getCount();

      return {
        data: result,
        count: total,
        freightDesactive: inactiveFreightsCount,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar fretes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /****************************************SOFT DELETE FREIGHT****************************************** */
  async softDeleteFreight(id: string): Promise<string> {
    const queryRunner =
      this.freightRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const freight = await queryRunner.manager.findOne(Freight, {
        where: { id },
      });

      if (!freight) {
        throw new HttpException(
          'Não foi localizado um frete para essa empresa',
          HttpStatus.BAD_REQUEST,
        );
      }
      await queryRunner.manager.update(
        Freight,
        { id },
        { isActive: false, openSolicitations: false },
      );
      await queryRunner.commitTransaction();

      return 'frete desativado com sucesso';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error?.message || 'Erro ao desativar frete da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /****************************************EXCLUDE FREIGHT****************************************** */
  async excludeFreight(id: string, userId: string): Promise<string> {
    const queryRunner =
      this.freightRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const freight = await queryRunner.manager.findOne(Freight, {
        where: { id },
      });

      if (!freight) {
        throw new HttpException(
          'Não foi localizado um frete para exclusão',
          HttpStatus.NOT_FOUND,
        );
      }

      if (freight.isExclude) {
        throw new HttpException(
          'Este frete já foi excluído',
          HttpStatus.BAD_REQUEST,
        );
      }

      await queryRunner.manager.update(
        Freight,
        { id },
        {
          isExclude: true,
          isExcludeUserId: userId,
          isActive: false,
          openSolicitations: false,
        },
      );

      await queryRunner.commitTransaction();

      return 'Frete excluído com sucesso';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error?.message || 'Erro ao excluir frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async activateFreight(id: string): Promise<string> {
    const queryRunner =
      this.freightRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const freight = await queryRunner.manager.findOne(Freight, {
        where: { id },
      });

      if (!freight) {
        throw new HttpException(
          'Não foi localizado um frete para essa empresa',
          HttpStatus.BAD_REQUEST,
        );
      }
      await queryRunner.manager.update(
        Freight,
        { id },
        { isActive: true, openSolicitations: true },
      );
      await queryRunner.commitTransaction();

      return 'frete desativado com sucesso';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error?.message || 'Erro ao desativar frete da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /****************************************FILTERS REGIONS****************************************** */
  async classifyRegionByState(userId: string): Promise<any> {
    try {
      const freights = await this.freightRepository.find({
        where: { companyId: userId, openSolicitations: true, isExclude: false },
      });

      const regions = {
        origin: {
          norte: new Set<string>(),
          nordeste: new Set<string>(),
          centroOeste: new Set<string>(),
          sudeste: new Set<string>(),
          sul: new Set<string>(),
        },
        destiny: {
          norte: new Set<string>(),
          nordeste: new Set<string>(),
          centroOeste: new Set<string>(),
          sudeste: new Set<string>(),
          sul: new Set<string>(),
        },
      };

      freights.forEach((freight) => {
        this.classifyCity(
          freight.originState,
          `${freight.originCity}`,
          regions.origin,
        );
        this.classifyCity(
          freight.destinyState,
          `${freight.destinyCity}`,
          regions.destiny,
        );
      });

      const formatRegions = (data: Record<string, Set<string>>) => {
        return Object.entries(data)
          .filter(([_, cities]) => cities.size > 0)
          .reduce((acc, [region, cities]) => {
            acc[region] = Array.from(cities);
            return acc;
          }, {});
      };

      return {
        origin: formatRegions(regions.origin),
        destiny: formatRegions(regions.destiny),
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao classificar as regiões',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private classifyCity(state: string, city: string, regions: any): void {
    const region = this.getRegionByState(state);
    if (region) {
      regions[region].add(city);
    }
  }

  private getRegionByState(state: string): string | null {
    const regionMapping = {
      norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
      nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
      centroOeste: ['DF', 'GO', 'MS', 'MT'],
      sudeste: ['ES', 'MG', 'RJ', 'SP'],
      sul: ['PR', 'RS', 'SC'],
    };

    for (const [region, states] of Object.entries(regionMapping)) {
      if (states.includes(state)) {
        return region;
      }
    }
    return null;
  }
  /****************************************FILTERS REGIONS****************************************** */
  async getFreightById(id: string): Promise<Freight> {
    try {
      const freight = await this.freightRepository.findOne({ where: { id } });

      if (!freight) {
        throw new HttpException('Frete não encontrado', HttpStatus.NOT_FOUND);
      }

      return freight;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar o frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /****************************************FREIGHT SHARING****************************************** */

  async sharingFreightUsers(body: SharingFreightDto, userId: string) {
    const { usersIds, freightId } = body;

    try {
      const subscription = await this.subscriptionCompanyRepository.findOne({
        where: { companyId: userId },
      });

      if (!subscription) {
        throw new HttpException(
          'Não encontramos uma assinatura ativa para esta empresa.',
          HttpStatus.NOT_FOUND,
        );
      }

      const featureUsageUser = await this.featureUsageRepository.find({
        where: { subscriptionId: subscription.id },
        relations: ['feature'],
      });

      const pushNotification = featureUsageUser.find(
        (usage) => usage.feature.name === 'push_notifications',
      );

      if (!pushNotification) {
        throw new HttpException(
          'O plano atual não inclui notificações push.',
          HttpStatus.FORBIDDEN,
        );
      }

      const usersCount = usersIds.length;
      if (usersCount > pushNotification.quantityUsed) {
        throw new HttpException(
          `Limite de notificações excedido. Disponível: ${pushNotification.quantityUsed - pushNotification.quantityUsed}, Necessário: ${usersCount}`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const users = await this.userDriveRepository.find({
        where: { id: In(usersIds) },
        select: ['pushToken'],
      });

      const pushTokens = users
        .map((user) => user.pushToken)
        .filter((token) => token !== null && token !== undefined);

      await this.sqsService.notifyFreightSharing(freightId, pushTokens);

      pushNotification.quantityUsed -= usersCount;
      await this.featureUsageRepository.save(pushNotification);

      const featureLog = this.featureLogsRepository.create({
        subscriptionId: subscription.id,
        featureId: pushNotification.feature.id,
        quantityChange: -usersCount,
        metadata: {
          freightId,
          usersIds,
          pushTokens,
        },
        relatedEntityId: freightId,
        description: `Uso de ${usersCount} notificações push para o frete ${freightId}`,
        performedById: userId,
        performedByType: 'USER',
      });

      await this.featureLogsRepository.save(featureLog);

      return {
        success: true,
        message: `Notificações enviadas para ${usersCount} usuários.`,
        remaining: pushNotification.quantityUsed,
      };
    } catch (error) {
      console.error('Erro ao compartilhar frete:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro interno ao processar notificações.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async freightIsFeatured(body: FreightIsFeatured, userId: string) {
    const { freightId } = body;

    const queryRunner =
      this.freightRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const subscription = await this.subscriptionCompanyRepository.findOne({
        where: { companyId: userId },
      });

      if (!subscription) {
        throw new HttpException(
          'Não encontramos uma assinatura ativa para esta empresa.',
          HttpStatus.NOT_FOUND,
        );
      }

      const featureUsageUser = await this.featureUsageRepository.find({
        where: { subscriptionId: subscription.id },
        relations: ['feature'],
      });

      const freteDestaque = featureUsageUser.find(
        (usage) => usage.feature.name === 'fretes_destaque',
      );

      if (!freteDestaque || freteDestaque.quantityUsed < 1) {
        throw new HttpException(
          'O plano atual não inclui fretes em destaque ou não há saldo disponível.',
          HttpStatus.FORBIDDEN,
        );
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await queryRunner.manager.update(
        Freight,
        { id: freightId },
        { isFeatured: true, expiresAt },
      );

      freteDestaque.quantityUsed -= 1;
      await queryRunner.manager.save(freteDestaque);

      const featureLog = this.featureLogsRepository.create({
        subscriptionId: subscription.id,
        featureId: freteDestaque.feature.id,
        quantityChange: -1,
        metadata: { freightId },
        relatedEntityId: freightId,
        description: `Uso de 1 frete destaque para o frete ${freightId}`,
        performedById: userId,
        performedByType: 'USER',
      });
      await queryRunner.manager.save(featureLog);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Frete marcado como destaque com sucesso.`,
        remaining: freteDestaque.quantityUsed,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao destacar frete:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro interno ao destacar frete.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
