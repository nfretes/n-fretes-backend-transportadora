import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsersDrive } from './users-drive.entity';
import { Freight } from './freight.entity';
import { Company } from './company.entity';
import { FreightRequest } from './freight-requests.entity';
import { FreightRoutes } from './freight-routes.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ enum: ['freightRequest', 'freightDelivery', 'chat', 'freightAccepted'] })
  type: 'freightRequest' | 'freightDelivery' | 'chat' | 'freightAccepted';

  @Column({ default: false })
  isRead: boolean;

  @Column()
  timestamp: string;

  // Relacionamento com FreightRequest (opcional, para notificações de solicitação de frete)
  @ManyToOne(() => FreightRequest, { nullable: true })
  @JoinColumn({ name: 'freightRequestId' })
  freightRequest?: FreightRequest;

  @Column({ nullable: true })
  freightRequestId?: string;

  // Relacionamento com Freight (opcional, para entregas ou fretes aceitos)
  @ManyToOne(() => Freight, { nullable: true })
  @JoinColumn({ name: 'freightId' })
  freight?: Freight;

  @Column({ nullable: true })
  freightId?: string;

  // Relacionamento com UsersDrive (opcional, para mensagens de chat ou ações do motorista)
  @ManyToOne(() => UsersDrive, { nullable: true })
  @JoinColumn({ name: 'userDriveId' })
  userDrive?: UsersDrive;

  @Column({ nullable: true })
  userDriveId?: string;

  // Relacionamento com Company (opcional, para notificações relacionadas a uma empresa)
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @Column({ nullable: true })
  companyId?: string;

  // Relacionamento com FreightRoutes (opcional, se a notificação for sobre uma rota específica)
  @ManyToOne(() => FreightRoutes, { nullable: true })
  @JoinColumn({ name: 'freightRouteId' })
  freightRoute?: FreightRoutes;

  @Column({ nullable: true })
  freightRouteId?: string;
}