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


export enum RouteStatus {
  IN_PROGRESS = 'PROGUESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCEL',
}

@Entity('freight_routes')
export class FreightRoutes {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  freightId: string | null;

  @Column({ nullable: true })
  userDriveId: string | null;

  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => Freight, (freight) => freight.FreightRoutes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'freightId' })
  freight: Freight;

  @ManyToOne(() => UsersDrive, (userDrive) => userDrive.FreightRoutes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userDriveId' })
  userDrive: UsersDrive;


  @ManyToOne(() => Company, (company) => company.FreightRoutes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({
    type: 'enum',
    enum: RouteStatus,
    default: RouteStatus.IN_PROGRESS,
  })
  status: RouteStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  completedAt: Date;
}
