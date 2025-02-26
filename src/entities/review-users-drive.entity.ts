import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UsersDrive } from './users-drive.entity';
import { Freight } from './freight.entity';
import { Company } from './company.entity';

export enum ReviewTags {
  OTIMO_MOTORISTA = 1,
  VEICULO_BOM_ESTADO = 2,
  EDUCADO = 3,
  ENTREGOU_NO_PRAZO = 4,
}

@Entity('reviews_user_drive')
export class ReviewUserDrive {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  freightId: string | null;

  @Column({ nullable: true })
  userDriveId: string | null;

  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => UsersDrive, (userDrive) => userDrive.reviewUserDrive, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userDriveId' })
  userDrive: UsersDrive;

  @ManyToOne(() => Freight, (freight) => freight.reviewUserDrive, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'freightId' })
  freight: Freight;

  @ManyToOne(() => Company, (company) => company.reviewUserDrive, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'simple-array' })
  tags: ReviewTags[];
}
