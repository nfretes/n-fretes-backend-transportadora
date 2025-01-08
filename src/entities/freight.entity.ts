import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import {
  FreightLocal,
  PaymentMethod,
  SpecieOfLoad,
  Toll,
  TypeOfLoad,
  UnityMetric,
} from 'src/enum/freight';
import { BodyType, VehicleType } from 'src/enum/vehicle';
import { ContactCompany } from './contact-company.entity';

@Entity({ schema: 'public', name: 'freight' })
export class Freight {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'enum', enum: FreightLocal, default: FreightLocal.NATIONAL })
  shippingLocation: FreightLocal;

  @Column({ nullable: true })
  originCity: string;

  @Column({ nullable: true })
  originState: string;

  @Column({ type: 'timestamp', nullable: true })
  dateOrigin: Date;

  @Column({ nullable: true })
  destinyCity: string;

  @Column({ nullable: true })
  destinyState: string;

  @Column({ type: 'timestamp', nullable: true })
  dateReceiver: Date;

  @Column({ type: 'enum', enum: TypeOfLoad, default: TypeOfLoad.COMPLETE })
  typeOfLoad: TypeOfLoad;

  @Column({ default: false })
  lona: boolean;

  @Column({ default: false })
  tracker: boolean;

  @Column({ nullable: true })
  product: string;

  @Column({ type: 'enum', enum: SpecieOfLoad })
  specieOfLoad: SpecieOfLoad;

  @Column({ nullable: true })
  weightOfLoad: string;

  @Column({ type: 'enum', enum: UnityMetric })
  unityMetric: UnityMetric;

  @Column({ nullable: true })
  volume: string;

  @Column({ default: true })
  security: boolean;

  @Column({ type: 'simple-array', nullable: true })
  vehicleTypes: VehicleType[];

  @Column({ type: 'simple-array', nullable: true })
  bodyTypes: BodyType[];

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'float', default: 0, nullable: true })
  valueFreight: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  calValue: PaymentMethod;

  @Column({ type: 'enum', enum: Toll })
  Toll: Toll;

  @Column({ nullable: true })
  methodPayment: string;

  @Column({ type: 'float', default: 0, nullable: true })
  advance: number;

  @Column({ nullable: true })
  observation: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  openSolicitations: boolean;

  @Column({ nullable: true })
  @Column()
  companyId: string;

  @ManyToOne(() => Company, (company) => company.freights)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  contactCompanyId: string;

  @ManyToOne(() => ContactCompany, (contactCompany) => contactCompany.freights)
  @JoinColumn({ name: 'contactCompanyId' })
  contactCompany: ContactCompany;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
