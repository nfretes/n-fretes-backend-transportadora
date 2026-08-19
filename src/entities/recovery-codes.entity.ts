import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recovery_codes')
export class RecoveryCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: number;

  @Column()
  phoneNumber: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;
}
