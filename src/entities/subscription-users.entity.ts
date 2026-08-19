import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PlansCompany } from './plans-company.entity';
import { UsersDrive } from './users-drive.entity';

@Entity({ schema: 'public', name: 'subscription_users_drive' })
export class SubscriptionUsersDrive {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true, default: 1 })
  status: number;
  @Column({ nullable: true })
  merchantOrderId?: string;

  @ManyToOne(() => PlansCompany)
  @JoinColumn({ name: 'planId' })
  plan: PlansCompany;

  @Column({ nullable: true })
  planId: string | null;

  @Column({ nullable: true })
  userId: string | null;

  @Column('float')
  amount: number;

  @Column({ nullable: true })
  nextRecurrency: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ nullable: true })
  interval: number;

  @OneToOne(() => UsersDrive, (userDrive) => userDrive.subscription)
  @JoinColumn({ name: 'userId' })
  userDrive: UsersDrive[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
