import { Freight } from '@entities/freight.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFreightDto } from './dto/freight.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseFreightDto } from './dto/response-freight.dto';
import { Company } from '@entities/company.entity';
import { ParamsFreight } from './interface/IFreight';
import { PaginationService } from '@components/pagination/pagination.service';

export class FreightService {
  constructor(
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,

    private readonly paginationService: PaginationService,
  ) {}

  async createFreightCompany(
    createFreightDto: CreateFreightDto,
    userId: string
  ): Promise<CreateFreightDto> {
    try {
      const data = {
        ...createFreightDto,
        companyId: userId
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

  async getFreightsByTransporter(params: ParamsFreight): Promise<any> {
    try {
      const queryBuilder = this.freightRepository.createQueryBuilder('freight');
  
      const { take, page } = this.paginationService.getDefaultPaginationParams(params);
  
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
      .addSelect('CASE WHEN subscription-company.status = 1 THEN 0 ELSE 1 END', 'status_priority')
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
}
