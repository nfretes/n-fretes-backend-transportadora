import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TollDataDto {
  @ApiProperty({ example: 'P05 - UBERABA' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ECO 050' })
  @IsString()
  @IsNotEmpty()
  concessionaria: string;

  @ApiProperty({ example: 'BR-050' })
  @IsString()
  @IsNotEmpty()
  rodovia: string;

  @ApiProperty({ example: 15.8 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: '104.900' })
  @IsString()
  km: string;

  @ApiProperty({ example: -19.18078 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -48.157509 })
  @IsNumber()
  longitude: number;
}

export class TollPointDto {
  @ApiProperty({ example: 'P05 - UBERABA' })
  @IsString()
  name: string;

  @ApiProperty({ example: -19.18078 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -48.157509 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 15.8 })
  @IsNumber()
  toll_price: number;
}

export class CoordinateDto {
  @ApiProperty({ example: -18.91907 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -48.27833 })
  @IsNumber()
  longitude: number;
}

export class RouteCoordinatesDto {
  @ApiProperty({ type: CoordinateDto })
  @ValidateNested()
  @Type(() => CoordinateDto)
  origin: CoordinateDto;

  @ApiProperty({ type: CoordinateDto })
  @ValidateNested()
  @Type(() => CoordinateDto)
  destination: CoordinateDto;

  @ApiProperty({ type: [TollPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TollPointDto)
  tollPoints: TollPointDto[];
}

export class CreateUpdateRouteCacheDto {
  @ApiProperty({
    description: 'Cidade de origem com estado',
    example: 'Uberlândia, MG',
  })
  @IsString()
  @IsNotEmpty()
  originCity: string;

  @ApiProperty({
    description: 'Cidade de destino com estado',
    example: 'São Paulo, SP',
  })
  @IsString()
  @IsNotEmpty()
  destinationCity: string;

  @ApiProperty({ type: [TollDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TollDataDto)
  tolls: TollDataDto[];

  @ApiProperty({ example: 274.3 })
  @IsNumber()
  totalToll: number;

  @ApiProperty({ example: 607 })
  @IsNumber()
  distance: number;

  @ApiProperty({ example: '607 km' })
  @IsString()
  distanceText: string;

  @ApiProperty({ example: '05:53:42' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 376.34 })
  @IsNumber()
  fuelConsumption: number;

  @ApiProperty({ type: RouteCoordinatesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => RouteCoordinatesDto)
  coordinates: RouteCoordinatesDto;
}
