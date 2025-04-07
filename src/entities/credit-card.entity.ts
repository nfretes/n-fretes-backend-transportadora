import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity({ schema: 'public', name: 'credit_card' })
export class CreditCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => Company, (company) => company.creditCard)
  @JoinColumn({ name: 'companyId' })
  company: Company[];

  @Column({ nullable: true })
  lastFourDigits: string;

  @Column()
  brand: string;

  @Column()
  holderName: string;

  @Column()
  expirationMonth: string;
  @Column()
  expirationYear: string;

  @Column()
  creditCardToken: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
