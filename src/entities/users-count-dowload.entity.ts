import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';

export enum PlatformType {
  IOS = 'ios',
  ANDROID = 'android',
}

@Entity({ schema: 'public', name: 'users_count_download' })
export class UsersCountDownload {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'enum', enum: PlatformType })
  platform: PlatformType;

  @CreateDateColumn()
  clickedAt: Date;
}
