import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@entities/notification.entity';
import { INotification } from './interface/INotification';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(): Promise<INotification[]> {
    const notifications = await this.notificationsRepository.find({
      relations: ['freightRequest', 'freight', 'userDrive', 'company', 'freightRoute'],
    });
    return notifications.map(this.mapToInterface);
  }

  async findByFilter(filter: 'all' | 'read' | 'unread'): Promise<INotification[]> {
    const query = {
      relations: ['freightRequest', 'freight', 'userDrive', 'company', 'freightRoute'],
    };
    let notifications: Notification[];
    if (filter === 'read') {
      notifications = await this.notificationsRepository.find({ ...query, where: { isRead: true } });
    } else if (filter === 'unread') {
      notifications = await this.notificationsRepository.find({ ...query, where: { isRead: false } });
    } else {
      notifications = await this.notificationsRepository.find(query);
    }
    return notifications.map(this.mapToInterface);
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationsRepository.update({}, { isRead: true });
  }

  async clearNotifications(): Promise<void> {
    await this.notificationsRepository.delete({});
  }

  async create(notification: Partial<INotification>): Promise<INotification> {
    // Filtra apenas os campos diretos da entidade Notification
    const newNotification = this.notificationsRepository.create({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead ?? false,
      timestamp: notification.timestamp || new Date().toISOString(),
      freightRequestId: notification.freightRequestId,
      freightId: notification.freightId,
      userDriveId: notification.userDriveId,
      companyId: notification.companyId,
      freightRouteId: notification.freightRouteId,
    });
    const savedNotification = await this.notificationsRepository.save(newNotification); // Retorna Notification
    return this.mapToInterface(savedNotification);
  }

  async createFromEvent(event: {
    type: INotification['type'];
    title: string;
    message: string;
    freightRequestId?: string;
    freightId?: string;
    userDriveId?: string;
    companyId?: string;
    freightRouteId?: string;
  }): Promise<INotification> {
    const notification = this.notificationsRepository.create({
      ...event,
      isRead: false,
      timestamp: new Date().toISOString(),
    });
    const savedNotification = await this.notificationsRepository.save(notification); // Retorna Notification
    return this.mapToInterface(savedNotification);
  }

  // Método auxiliar para mapear a entidade para a interface
  private mapToInterface(entity: Notification): INotification {
    return {
      id: entity.id,
      title: entity.title,
      message: entity.message,
      type: entity.type,
      isRead: entity.isRead,
      timestamp: entity.timestamp,
      freightRequestId: entity.freightRequestId,
      freightId: entity.freightId,
      userDriveId: entity.userDriveId,
      companyId: entity.companyId,
      freightRouteId: entity.freightRouteId,
      freightRequest: entity.freightRequest
        ? {
            id: entity.freightRequest.id,
            freightId: entity.freightRequest.freightId,
            userDriveId: entity.freightRequest.userDriveId,
            companyId: entity.freightRequest.companyId,
          }
        : undefined,
      freight: entity.freight
        ? {
            id: entity.freight.id,
            originCity: entity.freight.originCity,
            originState: entity.freight.originState,
            destinyCity: entity.freight.destinyCity,
            destinyState: entity.freight.destinyState,
            dateOrigin: entity.freight.dateOrigin?.toISOString(),
            dateReceiver: entity.freight.dateReceiver?.toISOString(),
            typeOfLoad: entity.freight.typeOfLoad,
            specieOfLoad: entity.freight.specieOfLoad,
            vehicleTypes: entity.freight.vehicleTypes, // string[]
            bodyTypes: entity.freight.bodyTypes, // string[]
            openSolicitations: entity.freight.openSolicitations,
            createdAt: entity.freight.createdAt?.toISOString(),
            companyId: entity.freight.companyId,
          }
        : undefined,
      userDrive: entity.userDrive
        ? {
            id: entity.userDrive.id,
            name: entity.userDrive.name,
          }
        : undefined,
      company: entity.company
        ? {
            id: entity.company.id,
            name: entity.company.name,
            nameFantasy: entity.company.nameFantasy,
            email: entity.company.email,
            phoneNumber: entity.company.phoneNumber,
            cnpj: entity.company.cnpj,
          }
        : undefined,
      freightRoute: entity.freightRoute
        ? {
            id: entity.freightRoute.id,
            freightId: entity.freightRoute.freightId,
            userDriveId: entity.freightRoute.userDriveId,
            
          }
        : undefined,
    };
  }
}