import { Controller, Get, Post, Body, Patch, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { INotification } from './interface/INotification';
import { CreateNotificationDto, CreateNotificationFromEventDto } from './dto/notifications.dto'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query('filter') filter: 'all' | 'read' | 'unread' = 'all'): Promise<INotification[]> {
    return this.notificationsService.findByFilter(filter);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() notification: CreateNotificationDto): Promise<INotification> {
    return this.notificationsService.create(notification);
  }

  @Post('event')
  @UsePipes(new ValidationPipe({ transform: true }))
  createFromEvent(@Body() event: CreateNotificationFromEventDto): Promise<INotification> {
    return this.notificationsService.createFromEvent(event);
  }

  @Patch('mark-all-read')
  markAllAsRead(): Promise<void> {
    return this.notificationsService.markAllAsRead();
  }

  @Delete()
  clearNotifications(): Promise<void> {
    return this.notificationsService.clearNotifications();
  }
}