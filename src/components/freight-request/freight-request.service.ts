import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FreightRequest,
  FreightRequestStatus,
} from '@entities/freight-requests.entity';
import { CreateFreightRequestDto } from './dto/create-freight-request.dto';
import { PaginationService } from '@components/pagination/pagination.service';
import { ParamsFreightRequest } from './interface/IFreightRequest';
import { Freight } from '@entities/freight.entity';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';

@Injectable()
export class FreightRequestService {
  constructor(
    @InjectRepository(FreightRequest)
    private readonly freightRequestRepository: Repository<FreightRequest>,
    @InjectRepository(Freight)
    private readonly freightRepository: Repository<Freight>,
    @InjectRepository(FreightRoutes)
    private readonly freightRoutesRepository: Repository<FreightRoutes>,
  ) {}

  async create(
    createFreightRequestDto: CreateFreightRequestDto,
  ): Promise<FreightRequest> {
    const newRequest = this.freightRequestRepository.create(
      createFreightRequestDto,
    );
    return await this.freightRequestRepository.save(newRequest);
  }

  async findAll(userId: string, params: ParamsFreightRequest = {}) {
    try {
      const take = params.take ?? 10;
      const page = params.page ?? 1;

      const queryBuilder = this.freightRequestRepository
        .createQueryBuilder('freight_requests')
        .where('freight_requests.companyId = :companyId', {
          companyId: userId,
        });

      const filters: Record<string, any> = {
        'freight_requests.id': params.id,
        'freight_requests.userDriveId': params.userDriveId,
        'freight_requests.freightId': params.freightId,
        'freight_requests.status': params.status,
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryBuilder.andWhere(`${key} = :${key}`, { [key]: value });
      });

      const [result, total] = await queryBuilder
        .select([
          'freight_requests.id',
          'freight_requests.freightId',
          'freight_requests.userDriveId',
          'freight_requests.companyId',
          'freight_requests.status',
        ])
        .leftJoinAndSelect('freight_requests.freight', 'freight')
        .leftJoin('freight.contactCompany', 'contact_company')
        .leftJoin('freight_requests.userDrive', 'users_drive')
        .leftJoin('users_drive.vehicles', 'vehicle')
        .leftJoin('users_drive.locations', 'location')
        .addSelect([
          'contact_company.name',
          'contact_company.phoneNumber',
          'users_drive.name',
          'users_drive.photoFaceURL',
          'users_drive.phoneNumber',
          'users_drive.id',
          'vehicle.vehicleType',
          'vehicle.bodyType',
          'location.city',
        ])
        .skip((page - 1) * take)
        .take(take)
        .getManyAndCount();

      return { data: result, count: total };
    } catch (error) {
      console.error('Erro no findAll:', error);
      throw new HttpException(
        'Erro ao buscar as solicitações de frete.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async acceptFreightRequest(
    freightRequestId: string,
    status: FreightRequestStatus,
  ) {
    const freightRequest = await this.freightRequestRepository.findOne({
      where: { id: freightRequestId },
      relations: ['freight'],
    });

    if (!freightRequest) {
      throw new HttpException(
        'Freight request not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      ![FreightRequestStatus.ACCEPTED, FreightRequestStatus.REJECTED].includes(
        status,
      )
    ) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    freightRequest.status = status;
    await this.freightRequestRepository.save(freightRequest);

    if (status === FreightRequestStatus.ACCEPTED) {
      const newFreightRoute = this.freightRoutesRepository.create({
        freightId: freightRequest.freightId,
        userDriveId: freightRequest.userDriveId,
        companyId: freightRequest.companyId,
        status: RouteStatus.IN_PROGRESS,
      });

      await this.freightRoutesRepository.save(newFreightRoute);

      if (freightRequest.freight) {
        freightRequest.freight.isActive = false;
        freightRequest.freight.openSolicitations = false;
        await this.freightRepository.save(freightRequest.freight);
      }

      return {
        success: true,
        message: 'Freight request accepted and route created',
        accepted: true,
      };
    }

    return {
      success: true,
      message: 'Freight request rejected',
      accepted: false,
    };
  }
}
