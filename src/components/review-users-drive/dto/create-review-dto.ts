import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
  IsArray,
} from 'class-validator';

import { ReviewTags } from '@entities/review-users-drive.entity';

export class CreateReviewDto {
  @IsString()
  userDriveId: string;

  @IsOptional()
  @IsUUID()
  freightId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsArray()
  tags: ReviewTags[];
}
