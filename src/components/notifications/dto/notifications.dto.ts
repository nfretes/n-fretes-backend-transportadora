import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { INotification } from '../interface/INotification'; 

export class CreateNotificationDto implements Partial<INotification> {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(['freightRequest', 'freightDelivery', 'chat', 'freightAccepted'])
  type: 'freightRequest' | 'freightDelivery' | 'chat' | 'freightAccepted';

  @IsBoolean()
  isRead: boolean;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  freightRequestId?: string;

  @IsOptional()
  @IsString()
  freightId?: string;

  @IsOptional()
  @IsString()
  userDriveId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  freightRouteId?: string;
}

export class CreateNotificationFromEventDto {
  @IsEnum(['freightRequest', 'freightDelivery', 'chat', 'freightAccepted'])
  type: 'freightRequest' | 'freightDelivery' | 'chat' | 'freightAccepted';

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  freightRequestId?: string;

  @IsOptional()
  @IsString()
  freightId?: string;

  @IsOptional()
  @IsString()
  userDriveId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  freightRouteId?: string;
}