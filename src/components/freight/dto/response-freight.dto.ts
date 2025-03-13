import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentMethod,
  SpecieOfLoad,
  Toll,
  TypeOfLoad,
  UnityMetric,
} from 'src/enum/freight';
import { BodyType, VehicleType } from 'src/enum/vehicle';

export class ResponseFreightDto {
  @ApiProperty({ description: 'ID do frete' })
  id: string;

  @ApiProperty({ description: 'Cidade de origem', required: false })
  originCity?: string;

  @ApiProperty({ description: 'Estado de origem', required: false })
  originState?: string;

  @ApiProperty({
    description: 'Data de origem',
    required: false,
    format: 'date-time',
  })
  dateOrigin?: Date;

  @ApiProperty({ description: 'Cidade de destino', required: false })
  destinyCity?: string;

  @ApiProperty({ description: 'Estado de destino', required: false })
  destinyState?: string;

  @ApiProperty({
    description: 'Data de recebimento',
    required: false,
    format: 'date-time',
  })
  dateReceiver?: Date;

  @ApiProperty({
    description: 'Tipo de carga',
    enum: TypeOfLoad,
    required: false,
  })
  typeOfLoad?: TypeOfLoad;

  @ApiProperty({ description: 'Possui lona', required: false, default: false })
  lona?: boolean;

  @ApiProperty({
    description: 'Possui rastreador',
    required: false,
    default: false,
  })
  tracker?: boolean;

  @ApiProperty({ description: 'Produto transportado', required: false })
  product?: string;

  @ApiProperty({
    description: 'Espécie de carga',
    enum: SpecieOfLoad,
    required: false,
  })
  specieOfLoad?: SpecieOfLoad;

  @ApiProperty({ description: 'Peso da carga', required: false })
  weightOfLoad?: string;

  @ApiProperty({
    description: 'Unidade métrica',
    enum: UnityMetric,
    required: false,
  })
  unityMetric?: UnityMetric;

  @ApiProperty({ description: 'Volume da carga', required: false })
  volume?: string;

  @ApiProperty({ description: 'Possui seguro', required: false, default: true })
  security?: boolean;

  @ApiProperty({
    description: 'Tipos de veículos permitidos',
    isArray: true,
    enum: VehicleType,
    required: false,
  })
  vehicleTypes?: VehicleType[];

  @ApiProperty({
    description: 'Tipos de carroceria permitidos',
    isArray: true,
    enum: BodyType,
    required: false,
  })
  bodyTypes?: BodyType[];

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    required: false,
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Valor do frete',
    required: false,
    type: 'number',
  })
  valueFreight?: number;

  @ApiProperty({
    description: 'Método de cálculo do valor',
    enum: PaymentMethod,
    required: false,
  })
  calValue?: PaymentMethod;

  @ApiProperty({
    description: 'Cobrança de pedágio',
    enum: Toll,
    required: false,
  })
  Toll?: Toll;

  @ApiProperty({ description: 'Método de pagamento', required: false })
  methodPayment?: string;

  @ApiProperty({
    description: 'Valor do adiantamento',
    required: false,
    type: 'number',
  })
  advance?: number;

  @ApiProperty({ description: 'Observações', required: false })
  observation?: string;

  @ApiProperty({ description: 'Está ativo?', required: false, default: true })
  isActive?: boolean;

  @ApiProperty({
    description: 'Solicitações abertas',
    required: false,
    default: true,
  })
  openSolicitations?: boolean;

  @ApiProperty({ description: 'ID da empresa', required: false })
  companyId?: string;

  @ApiProperty({ description: 'ID do contato da empresa', required: false })
  contactCompanyId?: string;
}
