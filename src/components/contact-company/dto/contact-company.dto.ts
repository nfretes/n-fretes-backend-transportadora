import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateContactCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsUUID()
  @IsNotEmpty()
  companyId?: string;
}

export class UpdateContactCompanyDto extends PartialType(
  CreateContactCompanyDto,
) {}
