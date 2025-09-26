import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('freight_quotes')
@Index(['origin', 'destination', 'commodity'], { unique: false })
export class FreightQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  date: string;

  @Column()
  commodity: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column({ nullable: true })
  typeFlag: string;

  @Column('decimal', { precision: 10, scale: 2 })
  predictedFreight: number;

  @Column('json')
  horizonPredictions: Array<{
    date: string;
    predicted_freight: number;
  }>;


  @Column('bigint')
  distance: number;

  @Column('int')
  duration: number;

  @Column('int')
  monthlyTotal: number;

  @Column('json')
  anttData: {
    version: string;
    inputs: {
      distance_km: number;
      axle_input: number;
      volume_input_tons: number;
      cargo_type_input: string;
    };
    user_result: {
      axle: number;
      volume_input: number;
      ccd: number;
      cc: number;
      total: number;
      r_per_ton: number;
    };
    standard_result: Array<{
      axle: number;
      tons_media: number;
      ccd: number;
      cc: number;
      total: number;
      r_per_ton: number;
    }>;
    meta: {
      resolution_date: string;
      cargo_type: string;
      table: string;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}