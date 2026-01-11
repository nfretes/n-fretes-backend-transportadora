import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


export enum DestinationType {
  CITY = 'CITY',
  STATE = 'STATE',
  REGION = 'REGION',
}

@Entity({ schema: 'public', name: 'users_favorite_destinations' })
export class UsersFavoriteDestination {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: DestinationType,
  })
  type: DestinationType;

  @Column()
  name: string;

  @Column({ nullable: true })
  state: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
