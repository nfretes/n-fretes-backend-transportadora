import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Freight } from './freight.entity';

@Entity({ schema: 'public', name: 'freight-documents' })
export class FreightDocument {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column()
  companyId: string;

  @Column()
  freightId: string;

  @Column()
  fileName: string;

  @Column()
  fileKey: string;

  @Column()
  fileUrl: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  fileSizeBytes: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Freight, (freight) => freight.documents)
  @JoinColumn({ name: 'freightId' })
  freight: Freight;
}
