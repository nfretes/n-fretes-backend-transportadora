import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@entities/notifications.entity';
import { NotificationStatus } from '@entities/notifications.entity';
import { ParamsNotificationsRequest } from './interfaces/INotificationParams';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(
    recipientId: string,
    params?: ParamsNotificationsRequest,
  ) {
    const { category, status, page = 1, take = 10 } = params || {};
    const skip = (page - 1) * take;
  
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notifications')
      .where('notifications.recipientId = :recipientId', { recipientId })
      .andWhere('notifications.status != :deletedStatus', { deletedStatus: 'deleted' }) 
      .orderBy('notifications.created_at', 'DESC')
      .skip(skip)
      .take(take);
  
    if (category) {
      queryBuilder.andWhere('notifications.category = :category', { category });
    }
    if (status) {
      queryBuilder.andWhere('notifications.status = :status', { status });
    }
  
    const [data, total] = await queryBuilder.getManyAndCount();
  
    return {
      data,
      total,
      page,
      pageCount: Math.ceil(total / take),
    };
  }

  async markAsRead(id: string, recipientId: string) {
    const notification = await this.notificationRepository.findOne({
      where: {id, recipientId, status: NotificationStatus.UNREAD },
    });

    if (notification) {
      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
      return this.notificationRepository.save(notification);
    }
    return null;
  }

  async deleteNotification(id: string,recipientId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipientId, status: NotificationStatus.READ },
    });

    if (notification) {
      notification.status = NotificationStatus.DELETED;
      return this.notificationRepository.save(notification);
    }
    return null;
  }
}
