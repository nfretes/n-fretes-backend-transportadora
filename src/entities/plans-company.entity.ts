import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionCompany } from './subscription-company.entity';

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

  @OneToMany(() => SubscriptionCompany, (subscription) => subscription.plan)
  subscriptions: SubscriptionCompany[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
