import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UsersDrive } from './users-drive.entity';
import { Freight } from './freight.entity';
import { Company } from './company.entity';
import { FreightRoutes } from './freight-routes.entity';

export enum ReviewTags {
  // 🚗 Veículo+1
  VEICULO_BOM_ESTADO = 1,

  // ✅ Pontualidade+10
  ENTREGA_NO_PRAZO = 10,
  ATRASADO = 11,
  ATRASO_NA_ENTREGA = 12,
  CUMPRE_HORARIO = 13,
  NAO_CUMPRE_HORARIO = 14,
  PONTUAL = 15,

  // 🗣️ Comunicação+20
  BOA_COMUNICACAO = 20,
  CONVERSA_DIFICIL = 21,
  RESPONDE_RAPIDO = 22,
  DEMORA_RESPONDER = 23,
  FACIL_CONVERSA = 24,

  // 🏅 Confiabilidade+30
  MUITO_CONFIAVEL = 30,
  POUCO_CONFIAVEL = 31,
  ABAIXO_DA_MEDIA = 32,

  // 👤 Comportamento+40
  EDUCADO = 40,
  DESRESPEITOSO = 41,

  // 🏆 Motorista+50
  OTIMO_MOTORISTA = 50,
}

//Se isUserReviewingCompany = true, significa que a avaliação foi feita por um usuário para uma empresa.
//Se isCompanyReviewingUser = true, significa que a avaliação foi feita por uma empresa para um usuário.

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

  @Column({ nullable: true })
  routeId: string | null;

  @Column({ type: 'boolean', default: false })
  isUserReviewingCompany: boolean;

  @Column({ type: 'boolean', default: false })
  isCompanyReviewingUser: boolean;

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

  @ManyToOne(
    () => FreightRoutes,
    (freightRoutes) => freightRoutes.reviewUserDrive,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'routeId' })
  freightRoute: Company;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'simple-array' })
  tags: ReviewTags[];
}
