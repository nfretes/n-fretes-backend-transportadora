import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { UserDriveAchievement } from './users-drive-achivement.entity';

@Entity({ schema: 'public', name: 'achievements' })
export class Achievement {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  requiredTags: number;

  @Column({ nullable: true })
  tagId: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(
    () => UserDriveAchievement,
    (userDriveAchivement) => userDriveAchivement.achievement,
  )
  userDriveAchievement: UserDriveAchievement[];
}
