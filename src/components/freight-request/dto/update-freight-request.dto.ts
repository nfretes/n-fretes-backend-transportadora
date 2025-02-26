import { PartialType } from '@nestjs/swagger';
import { CreateFreightRequestDto } from './create-freight-request.dto';

export class UpdateFreightRequestDto extends PartialType(
  CreateFreightRequestDto,
) {}
