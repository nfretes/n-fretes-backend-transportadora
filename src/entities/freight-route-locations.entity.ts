import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FreightRoutes } from './freight-routes.entity';

@Entity({ schema: 'public', name: 'freight_route_locations' })
export class FreightRouteLocations {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  routeId: string;

  @ManyToOne(() => FreightRoutes, (route) => route.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routeId' })
  route: FreightRoutes;
}
