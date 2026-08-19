import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PlansCompany } from './plans-company.entity';
import { PlanFeature } from './plan-features.entity';

@Entity({ schema: 'public', name: 'plan-feature-limits' })
export class PlanFeatureLimit {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @ManyToOne(() => PlansCompany)
  @JoinColumn({ name: 'planId' })
  plan: PlansCompany;

  @Column()
  planId: string;

  @ManyToOne(() => PlanFeature)
  @JoinColumn({ name: 'featureId' })
  feature: PlanFeature;

  @Column()
  featureId: string;

  @Column({ type: 'int', nullable: true })
  monthlyLimit: number;

  @Column({ type: 'boolean', default: false })
  included: boolean;
}
