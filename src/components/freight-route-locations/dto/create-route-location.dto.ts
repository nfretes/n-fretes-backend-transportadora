import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateRouteLocationDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsNotEmpty()
  @IsUUID()
  routeId: string;
}
