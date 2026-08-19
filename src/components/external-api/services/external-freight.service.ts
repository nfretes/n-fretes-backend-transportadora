import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Freight } from '@entities/freight.entity';
import {
  FreightQueryDto,
  FreightListResponseDto,
  FreightDataDto,
} from '../dto/freight-external.dto';

@Injectable()
export class ExternalFreightService {
  constructor(
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
  ) {}

  async getFreights(
    queryDto: FreightQueryDto,
  ): Promise<FreightListResponseDto> {
    try {
      const {
        page = 1,
        limit = 10,
        originCity,
        destinyCity,
        specieOfLoad,
      } = queryDto;

      const queryBuilder = this.freightRepository.createQueryBuilder('freight');

      if (originCity) {
        queryBuilder.andWhere(
          'unaccent(LOWER(freight.originCity)) ILIKE unaccent(LOWER(:originCity))',
          { originCity: `%${originCity}%` },
        );
      }

      if (destinyCity) {
        queryBuilder.andWhere(
          'unaccent(LOWER(freight.destinyCity)) ILIKE unaccent(LOWER(:destinyCity))',
          { destinyCity: `%${destinyCity}%` },
        );
      }

      if (specieOfLoad) {
        queryBuilder.andWhere('freight.specieOfLoad = :specieOfLoad', {
          specieOfLoad,
        });
      }

      queryBuilder.orderBy('freight.createdAt', 'DESC');

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [freights, total] = await queryBuilder.getManyAndCount();

      const data: FreightDataDto[] = freights.map((freight) => ({
        id: freight.id,
        originCity: freight.originCity,
        originState: freight.originState,
        destinyCity: freight.destinyCity,
        destinyState: freight.destinyState,
        dateOrigin: freight.dateOrigin,
        dateReceiver: freight.dateReceiver,
        typeOfLoad: freight.typeOfLoad,
        specieOfLoad: freight.specieOfLoad,
        weightOfLoad: freight.weightOfLoad,
        valueFreight: freight.Valuefreight || 0,
        valueCall: freight.valueCall,
        createdAt: freight.createdAt,
        product: freight.product,
        distance: freight.distance,
        updatedAt: freight.updatedAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Erro ao buscar fretes para API externa:', error);
      throw new HttpException(
        'Erro ao buscar dados de fretes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFreightById(id: string): Promise<FreightDataDto> {
    try {
      const freight = await this.freightRepository.findOne({
        where: {
          id,
          isActive: true,
        },
      });

      if (!freight) {
        throw new HttpException('Frete não encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        id: freight.id,
        originCity: freight.originCity,
        originState: freight.originState,
        destinyCity: freight.destinyCity,
        destinyState: freight.destinyState,
        dateOrigin: freight.dateOrigin,
        dateReceiver: freight.dateReceiver,
        typeOfLoad: freight.typeOfLoad,
        specieOfLoad: freight.specieOfLoad,
        weightOfLoad: freight.weightOfLoad,
        valueFreight: freight.Valuefreight || 0,
        valueCall: freight.valueCall,
        createdAt: freight.createdAt,
        product: freight.product,
        distance: freight.distance,
        updatedAt: freight.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Erro ao buscar frete por ID:', error);
      throw new HttpException(
        'Erro ao buscar frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
