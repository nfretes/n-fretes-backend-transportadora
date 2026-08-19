import {
  NotificationCategory,
  NotificationStatus,
} from '@entities/notifications.entity';

export interface ParamsNotificationsRequest {
  take?: number;
  page?: number;
  category?: NotificationCategory;
  status?: NotificationStatus;
  recipientId: string;
}
