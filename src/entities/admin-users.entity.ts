import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AdminRole } from 'src/enum/admin';

@Entity({ schema: 'public', name: 'admin' })
export class Admin {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: AdminRole })
  role: AdminRole;

  @Column()
  name: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastAccess: Date;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
