import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';
import { CompanyUsersContacts } from './company-users-contacts.entity';
import { UsersLocation } from './users-location.entity';

@Entity({ schema: 'public', name: 'users_drive' })
export class UsersDrive {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index({ unique: true })
  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  photoFaceURL?: string;

  @Column({ nullable: true })
  documentPhotoURL?: string;

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

  @Column({ nullable: true })
  device: string;

  @Column({ type: 'timestamp', nullable: true })
  lastAccess: Date;

  @Column({ nullable: true })
  accessIp: string;

  @Column({ nullable: true })
  antt: string;

  @Column({ nullable: true })
  cnh: string;

  @Column({ nullable: true })
  pushToken: string;

  @Column({ nullable: true, type: 'float', default: 0.0 })
  similiary: number;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
  vehicles: Vehicle[];

  @OneToMany(() => CompanyUsersContacts, (company) => company.users)
  CompanyUsersContacts: CompanyUsersContacts[];

  @OneToMany(() => UsersLocation, (location) => location.user)
  locations: UsersLocation[];
}
