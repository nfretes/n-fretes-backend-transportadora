import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';
import {
  TypeOfLoad,
  SpecieOfLoad,
  UnityMetric,
} from '../../../../enum/freight';

export class CreateFreightWebhookDto {
  @IsString()
  @IsNotEmpty()
  originCity: string;

  @IsString()
  @IsNotEmpty()
  originState: string;

  @IsOptional()
  @IsDateString()
  dateOrigin?: string;

  @IsString()
  @IsNotEmpty()
  destinyCity: string;

  @IsString()
  @IsNotEmpty()
  destinyState: string;

  @IsDateString()
  @IsNotEmpty()
  dateReceiver: string;

  @IsOptional()
  @IsEnum(TypeOfLoad)
  typeOfLoad?: TypeOfLoad;

  @IsOptional()
  @IsBoolean()
  lona?: boolean;

  @IsOptional()
  @IsBoolean()
  tracker?: boolean;

  @IsString()
  @IsNotEmpty()
  product: string;

  @IsEnum(SpecieOfLoad)
  @IsNotEmpty()
  specieOfLoad: SpecieOfLoad;

  @IsString()
  @IsNotEmpty()
  weightOfLoad: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsEnum(UnityMetric)
  @IsNotEmpty()
  valueCall: UnityMetric;

  @IsString()
  @IsNotEmpty()
  vehicleTypes: string;

  @IsString()
  @IsNotEmpty()
  bodyTypes: string;
}
