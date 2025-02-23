import { Freight } from '@entities/freight.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFreightDto, UpdateFreightDto } from './dto/freight.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseFreightDto } from './dto/response-freight.dto';
import { Company } from '@entities/company.entity';
import { ParamsFreight } from './interface/IFreight';
import { PaginationService } from '@components/pagination/pagination.service';

export class FreightService {
  private readonly regionMapping = {
    norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    centroOeste: ['DF', 'GO', 'MS', 'MT'],
    sudeste: ['ES', 'MG', 'RJ', 'SP'],
    sul: ['PR', 'RS', 'SC'],
  };
  constructor(
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private readonly paginationService: PaginationService,
  ) {}

  /****************************************CREATE FREIGHT****************************************** */
  async createFreightCompany(
    createFreightDto: CreateFreightDto,
    userId: string,
  ): Promise<CreateFreightDto> {
    try {
      const data = {
        ...createFreightDto,
        companyId: userId,
      };
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

      return freight;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar o localizado espéfico',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /****************************************ALL FREIGHT USERID****************************************** */

  async getFreightsByTransporter(params: ParamsFreight): Promise<any> {
    try {
      const queryBuilder = this.freightRepository.createQueryBuilder('freight');

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
      };

      const dateFilters = {
        dateOrigin: `freight.dateOrigin = :dateOrigin`,
        dateReceiver: `freight.dateReceiver = :dateReceiver`,
        createdAt: `freight.createdAt = :createdAt`,
      };

      queryBuilder.where('freight.companyId = :companyId', { companyId });

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
        where: { companyId: userId },
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
}



