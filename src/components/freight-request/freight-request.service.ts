import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FreightRequest,
  FreightRequestStatus,
} from '@entities/freight-requests.entity';
import { CreateFreightRequestDto } from './dto/create-freight-request.dto';
import { ParamsFreightRequest } from './interface/IFreightRequest';
import { Freight } from '@entities/freight.entity';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { addHoursToSaoPauloTime } from '@components/utils/formatTime-SP';
import { SQSService } from '@components/sqs/sqs.service';
import { EntityType, IconStyles, Notification, NotificationCategory, NotificationStatus } from '@entities/notifications.entity';
@Injectable()
export class FreightRequestService {
  constructor(
    @InjectRepository(FreightRequest)
    private readonly freightRequestRepository: Repository<FreightRequest>,
    @InjectRepository(Freight)
    private readonly freightRepository: Repository<Freight>,
    @InjectRepository(FreightRoutes)
    private readonly freightRoutesRepository: Repository<FreightRoutes>,
    @InjectRepository(UsersDrive)
    private readonly userDriveRepository: Repository<UsersDrive>,
    private readonly sqsService: SQSService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    createFreightRequestDto: CreateFreightRequestDto,
  ): Promise<FreightRequest> {
    try {
      const newRequest = this.freightRequestRepository.create(
        createFreightRequestDto,
      );
      return await this.freightRequestRepository.save(newRequest);
    } catch (error) {
      console.error('Erro na solicitação do frete:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
          'freight_requests.solicitationsOrder',
          'freight_requests.expiresAt'
        ])
        .leftJoinAndSelect('freight_requests.freight', 'freight')
        .leftJoin('freight.contactCompany', 'contact_company')
        .leftJoin('freight_requests.userDrive', 'users_drive')
        .leftJoin('users_drive.vehicles', 'vehicle')
        .leftJoin('users_drive.locations', 'location')
        .leftJoinAndSelect('users_drive.reviewUserDrive', 'reviewUserDrive')
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
          'vehicle.vehicleType',
          'vehicle.bodyType',
          'location.city',
          'location.latitude',
          'location.longitude',
        ])
    
        .orderBy('freight_requests.solicitationsOrder', 'ASC')
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
  

  async acceptFreightRequest(freightRequestId: string) {
    try {
      const freightRequest = await this.freightRequestRepository.findOne({
        where: { id: freightRequestId },
        relations: ['freight', 'company'],
      });
  
      if (!freightRequest) {
        throw new HttpException(
          'Freight request not found',
          HttpStatus.NOT_FOUND,
        );
      }
  
      const freightId = freightRequest.freightId;  
      const userDriveId = freightRequest.userDriveId;
  
   
    
      const activeRoute = await this.freightRoutesRepository.findOne({
        where: { userDriveId, status: RouteStatus.IN_PROGRESS },
      });
  
      if (activeRoute) {
        freightRequest.status = FreightRequestStatus.REJECTED;
        await this.freightRequestRepository.save(freightRequest);
  
        return {
          success: false,
          message: 'Motorista já está em rota ativa!',
          accepted: false,
        };
      }
  
     
      freightRequest.status = FreightRequestStatus.AWAITING_USER_DRIVE_RESPONSE;

      const currentDate = new Date();
      const time = addHoursToSaoPauloTime(currentDate, 1)
      freightRequest.expiresAt = time
  
      await this.freightRequestRepository.save(freightRequest);
      const notification = this.notificationRepository.create({
        title: 'Frete aceito',
        message: `A Transportadora ${freightRequest?.company?.name} aceitou seu frete ${freightRequest?.freight?.originCity} → ${freightRequest?.freight?.destinyCity}.`,
        senderType: EntityType.COMPANY,
        senderId: freightRequest.companyId,
        recipientType: EntityType.USER, 
        recipientId: freightRequest.userDriveId,
        category: NotificationCategory.FREIGHT,
        status: NotificationStatus.UNREAD,
        payload: {
          message: 'Parabéns! Seu frete foi aceito. Confirme a solicitação para dar início a essa rota.',
        },
        iconStyle: IconStyles.FREIGHT_ACCEPTED,
        createdAt: new Date(),
      });
      
      await this.notificationRepository.save(notification);

      await this.sqsService.sendNotificationToDriver({
        freightRequestId,
        driverId: userDriveId,
        freightId,
        status:  FreightRequestStatus.AWAITING_USER_DRIVE_RESPONSE,
        expiresAt: time.toISOString(),
      })
  
      return {
        success: true,
        message: 'Aguardando resposta do motorista.',
        accepted: true,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        const response = error.getResponse();
        const statusCode = error.getStatus();
        return {
          code: statusCode,
          error: response
        };
      }
    
      console.error('Erro no accept fretes:', error);
      throw new HttpException(
        error.message || 'Erro interno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   async confirmedFreightRequest(freightRequestId: string) {
    try {
      const freightRequest = await this.freightRequestRepository.findOne({
        where: { id: freightRequestId,  status: FreightRequestStatus.DRIVER_CONFIRMED_DELIVERY },
        relations: ['freight', 'company'],
      });
  
      if (!freightRequest) {
        throw new HttpException(
          'Freight request not found',
          HttpStatus.NOT_FOUND,
        );
      }
  
      const freightId = freightRequest.freightId;  
      const userDriveId = freightRequest.userDriveId;
  
   
       const activeRoute = await this.freightRoutesRepository.findOne({
        where: { userDriveId, status: RouteStatus.IN_PROGRESS, freightId: freightRequest.freightId },
      });

      
      if (activeRoute) {
        activeRoute.status = RouteStatus.COMPLETED;
        await this.freightRoutesRepository.save(activeRoute);
      }
   
  
       
      freightRequest.status = FreightRequestStatus.DELIVERY_COMPLETED;

      const currentDate = new Date();
      freightRequest.expiresAt = currentDate
      
  
      await this.freightRequestRepository.save(freightRequest);
      const notification = this.notificationRepository.create({
        title: 'Frete confirmado',
        message: `A Transportadora ${freightRequest?.company?.name} confirmou a entrega ${freightRequest?.freight?.originCity} → ${freightRequest?.freight?.destinyCity}.`,
        senderType: EntityType.COMPANY,
        senderId: freightRequest.companyId,
        recipientType: EntityType.USER, 
        recipientId: freightRequest.userDriveId,
        category: NotificationCategory.FREIGHT,
        status: NotificationStatus.UNREAD,
        payload: {
          message: 'Frete confirmado entregue não esqueça de avaliar esse frete.',
        },
        iconStyle: IconStyles.FREIGHT_ACCEPTED,
        createdAt: new Date(),
      });
      
      await this.notificationRepository.save(notification);

      await this.sqsService.sendNotificationToDriver({
        freightRequestId,
        driverId: userDriveId,
        freightId,
        status:  FreightRequestStatus.DELIVERY_COMPLETED,
        expiresAt: currentDate.toISOString(),
      })
  
      return {
        success: true,
        message: 'Frete confirmado.',
        accepted: true,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        const response = error.getResponse();
        const statusCode = error.getStatus();
        return {
          code: statusCode,
          error: response
        };
      }
    
      console.error('Erro no accept fretes:', error);
      throw new HttpException(
        error.message || 'Erro interno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async acceptFreightRequestUserDrive(freightRequestId: string, status: FreightRequestStatus) {
    try {
   
      if (![FreightRequestStatus.ACCEPTED, FreightRequestStatus.REJECTED].includes(status)) {
        throw new HttpException('Status inválido.', HttpStatus.BAD_REQUEST);
      }

      const freightRequest = await this.freightRequestRepository.findOneOrFail({
        where: { id: freightRequestId },
        relations: ['freight', 'freightRoutes'],
      });
  
      const userDriveId = freightRequest.userDriveId;
  
    
      const activeRoute = await this.freightRoutesRepository.findOne({
        where: { userDriveId, status: RouteStatus.IN_PROGRESS },
      });
  
      if (activeRoute) {
        freightRequest.status = FreightRequestStatus.REJECTED;
        await this.freightRequestRepository.save(freightRequest);
  
        return {
          success: false,
          message: 'Rota ativa, solicitação rejeitada.',
          accepted: false,
        };
      }
  
     
      if (status === FreightRequestStatus.ACCEPTED) {
  
        const userDrive = await this.userDriveRepository.findOneOrFail({
          where: { id: userDriveId },
        });
  
        userDrive.isOnRoute = true;
        await this.userDriveRepository.save(userDrive);
  
   
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
  
        freightRequest.status = FreightRequestStatus.ACCEPTED;
        await this.freightRequestRepository.save(freightRequest);
  
        return {
          success: true,
          message: 'Solicitação de frete aceita com sucesso.',
        };
      } else {
      
        freightRequest.status = FreightRequestStatus.REJECTED;
        await this.freightRequestRepository.save(freightRequest);
  
        return {
          success: false,
          message: 'Solicitação de frete rejeitada.',
        };
      }
    } catch (error) {
      if (error instanceof HttpException) {
      
        return {
          success: false,
          error: error.getResponse(),
          code: error.getStatus(),
        };
      }
  
      console.error('Erro ao aceitar solicitação de frete:', error);
      throw new HttpException(
        error.message || 'Erro interno ao processar solicitação de frete.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  
}
