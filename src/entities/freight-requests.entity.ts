import {
  Entity,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { Freight } from './freight.entity';
import { UsersDrive } from './users-drive.entity';
import { Company } from './company.entity';

export enum FreightRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('freight_requests')
export class FreightRequest {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  freightId: string | null;

  @Column({ nullable: true })
  userDriveId: string | null;

  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => Freight, (freight) => freight.freightRequest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'freightId' })
  freight: Freight;

  @ManyToOne(() => UsersDrive, (userDrive) => userDrive.freightRequest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userDriveId' })
  userDrive: UsersDrive;

  @ManyToOne(() => Company, (company) => company.freightRequest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({
    type: 'enum',
    enum: FreightRequestStatus,
    default: FreightRequestStatus.PENDING,
  })
  status: FreightRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
