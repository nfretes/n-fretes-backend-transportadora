import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  FreightLocal,
  PaymentMethod,
  SpecieOfLoad,
  Toll,
  TypeOfLoad,
  UnityMetric,
} from 'src/enum/freight';
import { BodyType, VehicleType } from 'src/enum/vehicle';

export class CreateFreightDto {
  @ApiProperty({
    description: 'Localização de envio',
    enum: FreightLocal,
    default: FreightLocal.NATIONAL,
  })
  @IsEnum(FreightLocal)
  @IsOptional()
  shippingLocation?: FreightLocal;

  @ApiProperty({ description: 'Cidade de origem', required: false })
  @IsString()
  @IsOptional()
  originCity?: string;

  @ApiProperty({ description: 'Estado de origem', required: false })
  @IsString()
  @IsOptional()
  originState?: string;

  @ApiProperty({
    description: 'Data de origem',
    required: false,
    format: 'date-time',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '' || value === null || value === undefined) {
      return null;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  })
  dateOrigin?: Date;

  @ApiProperty({ description: 'Cidade de destino', required: false })
  @IsString()
  @IsOptional()
  destinyCity?: string;

  @ApiProperty({ description: 'Estado de destino', required: false })
  @IsString()
  @IsOptional()
  destinyState?: string;

  @ApiProperty({
    description: 'Data de recebimento',
    required: false,
    format: 'date-time',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '' || value === null || value === undefined) {
      return null;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  })
  dateReceiver?: Date;

  @ApiProperty({
    description: 'Tipo de carga',
    enum: TypeOfLoad,
    default: TypeOfLoad.COMPLETE,
  })
  @IsEnum(TypeOfLoad)
  @IsNotEmpty()
  typeOfLoad?: TypeOfLoad;

  @ApiProperty({ description: 'Possui lona', required: false, default: false })
  @IsBoolean()
  @IsNotEmpty()
  lona?: boolean;

  @ApiProperty({
    description: 'Possui rastreador',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  tracker?: boolean;

  @ApiProperty({ description: 'Produto transportado', required: false })
  @IsString()
  @IsNotEmpty()
  product?: string;

  @ApiProperty({
    description: 'Espécie de carga',
    enum: SpecieOfLoad,
    required: false,
  })
  @IsEnum(SpecieOfLoad)
  @IsNotEmpty()
  specieOfLoad?: SpecieOfLoad;

  @ApiProperty({ description: 'Peso da carga', required: false })
  @IsString()
  @IsOptional()
  weightOfLoad?: string;

  @ApiProperty({
    description: 'Unidade métrica',
    enum: UnityMetric,
    required: false,
  })
  @IsEnum(UnityMetric)
  @IsOptional()
  unityMetric?: UnityMetric;

  @ApiProperty({
    description: 'Unidade de medida',
    required: true,
  })
  @IsOptional()
  valueCall?: string;

  @ApiProperty({ description: 'Volume da carga', required: false })
  @IsString()
  @IsOptional()
  volume?: string;

  @ApiProperty({
    description: 'Longitude e Latitude da origem',
    required: false,
  })
  @IsString()
  @IsOptional()
  originLongitude?: string;

  @ApiProperty({
    description: 'Longitude e Latitude da origem',
    required: false,
  })
  @IsString()
  @IsOptional()
  originLatitude?: string;

  @ApiProperty({
    description: 'Longitude e Latitude do destino',
    required: false,
  })
  @IsString()
  @IsOptional()
  destinyLongitude?: string;

  @ApiProperty({
    description: 'Longitude e Latitude do destino',
    required: false,
  })
  @IsString()
  @IsOptional()
  destinyLatitude?: string;

  @ApiProperty({ description: 'Distancia total do percurso', required: false })
  @IsString()
  @IsOptional()
  distance?: string;

  @ApiProperty({ description: 'Possui seguro', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  security?: boolean;

  @ApiProperty({
    description: 'Tipos de veículos permitidos',
    isArray: true,
    enum: VehicleType,
    required: false,
  })
  @IsArray()
  @IsEnum(VehicleType, { each: true })
  @IsNotEmpty()
  vehicleTypes?: VehicleType[];

  @ApiProperty({
    description: 'Tipos de carroceria permitidos',
    isArray: true,
    enum: BodyType,
    required: false,
  })
  @IsArray()
  @IsEnum(BodyType, { each: true })
  @IsNotEmpty()
  bodyTypes?: BodyType[];

  @ApiProperty({
    description: 'Valor do frete',
    required: false,
    type: 'number',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  valueFreight?: number;

  @ApiProperty({
    description: 'Método de cálculo do valor',
    enum: PaymentMethod,
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  calValue?: PaymentMethod;

  @ApiProperty({
    description: 'Cobrança de pedágio',
    enum: Toll,
    required: false,
  })
  @IsEnum(Toll)
  @IsNotEmpty()
  Toll?: Toll;

  @ApiProperty({ description: 'Método de pagamento', required: false })
  @IsString()
  @IsOptional()
  methodPayment?: string;

  @ApiProperty({
    description: 'Valor do adiantamento',
    required: false,
    type: 'number',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  advance?: number;

  @ApiProperty({ description: 'Observações', required: false })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiProperty({ description: 'Está ativo?', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Solicitações abertas',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  openSolicitations?: boolean;

  @ApiProperty({ description: 'ID da empresa', required: false })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ description: 'ID do contato da empresa', required: false })
  @IsString()
  @IsNotEmpty()
  contactCompanyId?: string;
}

export class UpdateFreightDto extends PartialType(CreateFreightDto) {}
