import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { ParamsNotificationsRequest } from './interfaces/INotificationParams';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @GetUserId() recipientId: string,
    @Query() params: ParamsNotificationsRequest,
  ) {
    return this.notificationService.getNotifications(recipientId, params);
  }

  @Patch('read/:id')
  async markAsRead(@GetUserId() recipientId: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, recipientId);
  }

  @Delete(':id')
  async deleteNotification(
    @GetUserId() recipientId: string,
    @Param('id') id: string,
  ) {
    return this.notificationService.deleteNotification(id, recipientId);
  }
}
