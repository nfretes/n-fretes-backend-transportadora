import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { UsersDrive } from './users-drive.entity';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX',
  BOLETO = 'BOLETO',
}

export enum TransactionType {
  COMPANY = 'COMPANY',
  USER = 'USER',
}

@Entity({ schema: 'public', name: 'transactions' })
export class Transactions {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  companyId: string | null;

  @Column({ nullable: true })
  userId: string | null;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod | null;

  @Column({ type: 'enum', enum: TransactionType, nullable: true })
  transactionType: TransactionType | null;
  
  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date | null;

  @ManyToOne(() => Company, (company) => company.transactions)
  @JoinColumn({ name: 'companyId' })
  company: Company[];

  @ManyToOne(() => UsersDrive, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: UsersDrive[];
}
