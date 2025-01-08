import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { ContactCompany } from './contact-company.entity';
import { Freight } from './freight.entity';


@Entity({ schema: 'public', name: 'company' })
export class Company {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  nameFantasy: string;

  @Column({ nullable: true })
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  phoneContact: string;

  @Index({ unique: true })
  @Column({ nullable: true })
  cnpj: string;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  contractSocial: string;

  @Column({ type: 'json', nullable: true })
  socios: any;


  @Column({ nullable: true })
  transportCategory: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isOn: boolean;

  @Column({ nullable: true })
  antt: string;

  @Column({ nullable: true })
  accessIp: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  documentsUrl?: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  complement?: string;

  @Column({ nullable: true })
  district: string;

  @OneToMany(() => ContactCompany, (contact) => contact.company)
  contacts: ContactCompany[];

  @OneToMany(() => Freight, (freight) => freight.company)
  freights: Freight[];

}
