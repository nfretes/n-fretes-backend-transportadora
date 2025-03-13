import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { UsersDrive } from './users-drive.entity';

import { Achievement } from './achivement.entity';

@Entity('user_drive_achievements')
export class UserDriveAchievement {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  achievementId: string | null;

  @Column({ nullable: true })
  userDriveId: string | null;

  @ManyToOne(() => UsersDrive, (userDrive) => userDrive.userDriveAchievement, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userDriveId' })
  userDrive: UsersDrive;

  @ManyToOne(() => Achievement, (achivement) => achivement.userDriveAchievement, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'achievementId' })
  achievement: Achievement;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  achievedAt: Date;
}
