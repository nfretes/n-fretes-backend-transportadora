import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';
import { ParamsFreightRoute } from './interface/IFreightRoute';
import { UsersDrive } from '@entities/users-drive.entity';

@Injectable()
export class FreightRouteService {
  constructor(
    @InjectRepository(FreightRoutes)
    private readonly freightRoutesRepository: Repository<FreightRoutes>,
    @InjectRepository(UsersDrive)
    private readonly userDriveRepository: Repository<UsersDrive>,
  ) {}

  async findAll(userId: string, params: ParamsFreightRoute = {}) {
    try {
      const take = params.take ?? 10;
      const page = params.page ?? 1;

      const queryBuilder = this.freightRoutesRepository
      .createQueryBuilder('freight_routes')
      .leftJoinAndSelect('freight_routes.freight', 'freight')
      .leftJoin('freight.contactCompany', 'contact_company')
      .leftJoin('freight_routes.userDrive', 'users_drive')
      .leftJoin('users_drive.vehicles', 'vehicle')
      .leftJoin('users_drive.locations', 'location')
      .leftJoin('users_drive.reviewUserDrive', 'reviewUserDrive')
      .loadRelationCountAndMap('freight_routes.reviewCount', 'users_drive.reviewUserDrive')
      .addSelect([
        'contact_company.name',
        'contact_company.phoneNumber',
        'users_drive.name',
        'users_drive.cnh',
        'users_drive.antt',
        'users_drive.pushToken',
        'users_drive.city',
        'users_drive.photoFaceURL',
        'users_drive.phoneNumber',
        'users_drive.id',
        'users_drive.street',
        'users_drive.number',
        'users_drive.state',
        'users_drive.zipcode',
        'vehicle.vehicleType',
        'vehicle.bodyType',
        'location.city',
        'location.latitude',
        'location.longitude',
        'reviewUserDrive.rating',
      ])
      .where('freight_routes.companyId = :companyId', { companyId: userId });
    
      const filters: Record<string, any> = {
        'freight_routes.id': params.id,
        'freight_routes.userDriveId': params.userDriveId,
        'freight_routes.freightId': params.freightId,
        'freight_routes.status': params.status,
        'freight_routes.isActive': params.isActive,
        'freight_routes.avalationUserDrive': params.avalationUserDrive
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryBuilder.andWhere(`${key} = :${key}`, { [key]: value });
      });

      if (params.name) {
        queryBuilder.andWhere(
          '(unaccent(LOWER(users_drive.name)) ILIKE unaccent(LOWER(:name)))',
          { name: `%${params.name}%` },
        );
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * take)
        .take(take)
        .getManyAndCount();

      return { data: result, count: total };
    } catch (error) {
      console.error('Erro no findAllRoutes:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus(routeId: string, status: RouteStatus) {
    try {
      if (![RouteStatus.CANCELED, RouteStatus.COMPLETED].includes(status)) {
        throw new HttpException('Status inválido', HttpStatus.BAD_REQUEST);
      }

      const freightRoute = await this.freightRoutesRepository.findOne({
        where: { id: routeId },
      });

      if (!freightRoute) {
        throw new HttpException('Frete não encontrado', HttpStatus.NOT_FOUND);
      }

      freightRoute.status = status;
      freightRoute.isActive = false;
      freightRoute.completedAt = new Date();

      await this.freightRoutesRepository.save(freightRoute);

      const userDrive = await this.userDriveRepository.findOne({
        where: { id: freightRoute.userDriveId },
      });
      userDrive.isOnRoute = false;
      await this.userDriveRepository.save(userDrive);

      return { message: `Frete ${status.toLowerCase()} com sucesso!`, result: true };
    } catch (error) {
      console.error('Erro ao atualizar status do frete:', error);
      throw new HttpException(
        'Erro ao atualizar status do frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
