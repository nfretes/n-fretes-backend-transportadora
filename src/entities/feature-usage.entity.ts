import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubscriptionCompany } from './subscription-company.entity';
import { PlanFeature } from './plan-features.entity';

@Entity({ schema: 'public', name: 'feature-usage' })
export class FeatureUsage {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @ManyToOne(() => SubscriptionCompany)
  @JoinColumn({ name: 'subscriptionId' })
  subscription: SubscriptionCompany;

  @Column()
  subscriptionId: string;

  @ManyToOne(() => PlanFeature)
  @JoinColumn({ name: 'featureId' })
  feature: PlanFeature;

  @Column()
  featureId: string;

  @Column({ type: 'int' })
  quantityUsed: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  usedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
