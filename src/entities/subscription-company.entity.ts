import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Company } from './company.entity';
import { PlansCompany } from './plans-company.entity';
import { FeatureUsage } from './feature-usage.entity';

@Entity({ schema: 'public', name: 'subscription-company' })
export class SubscriptionCompany {
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
  companyId: string | null;

  @Column('float')
  amount: number;

  @Column({ nullable: true })
  nextRecurrency: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ nullable: true })
  interval: number;

  @Column({ nullable: true })
  trialStartDate: Date;

  @Column({ nullable: true })
  trialEndDate: Date;

  @Column({ default: false })
  isInTrial: boolean;

  @OneToOne(() => Company, (company) => company.subscription)
  @JoinColumn({ name: 'companyId' })
  company: Company[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FeatureUsage, (usage) => usage.subscription)
  featureUsages: FeatureUsage[];
}
