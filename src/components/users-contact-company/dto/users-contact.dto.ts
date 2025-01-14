import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompanyUsersContactsDto {
  @ApiProperty({
    description: 'ID of the associated company',
    example: 'c4d4f72c-6d9b-4b1b-9936-b857a3d939b8',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  companyId?: string | null;

  @ApiProperty({
    description: 'ID of the associated user',
    example: 'b4d4f72c-6d9b-4b1b-9936-b857a3d939c9',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  userId?: string | null;

  @ApiProperty({
    description: 'Indicates if the contact is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Date when the record was created',
    example: '2025-01-14T12:00:00.000Z',
  })
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    description: 'Date when the record was last updated',
    example: '2025-01-14T12:00:00.000Z',
  })
  @IsOptional()
  updatedAt?: Date;
}
export class updateCompanyUsersContactsDto extends PartialType(CompanyUsersContactsDto) {}