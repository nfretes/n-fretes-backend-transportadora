import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionCompany } from './subscription-company.entity';
import { PlanFeatureLimit } from './plan-feature-limits.entity';

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
  WEEKLY = 'WEEKLY',
}

@Entity({ schema: 'public', name: 'plans-company' })
export class PlansCompany {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column()
  description: string;

  @Column()
  name: string;

  @Column({ default: true })
  status: boolean;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'int', default: 0 })
  trialDays: number;

  @Column({ default: false })
  isTrial: boolean;

  @OneToMany(() => SubscriptionCompany, (subscription) => subscription.plan)
  subscriptions: SubscriptionCompany[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @OneToMany(() => PlanFeatureLimit, (limit) => limit.plan)
  featureLimits: PlanFeatureLimit[];
}
