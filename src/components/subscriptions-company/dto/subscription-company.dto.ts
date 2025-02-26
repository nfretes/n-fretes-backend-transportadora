import { PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { SubscriptionStates } from 'src/enum/subscription-company';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionStates)
  @IsNotEmpty()
  status: SubscriptionStates;

  @IsString()
  @IsOptional()
  merchantOrderId?: string;

  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsUUID()
  @IsNotEmpty()
  companyId?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsOptional()
  nextRecurrency?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  interval?: number;
}

export class UpdateSubscriptionCompanyDto extends PartialType(
  CreateSubscriptionDto,
) {}
