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

@Entity({ schema: 'public', name: 'feature-logs' })
export class FeatureLog {
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
  quantityChange: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  loggedAt: Date;

  @Column({ nullable: true })
  performedById: string;

  @Column({ nullable: true })
  performedByType: 'USER' | 'SYSTEM' | 'ADMIN';
}
