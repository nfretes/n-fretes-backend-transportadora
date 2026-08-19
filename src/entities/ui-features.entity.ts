import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UIFeatureType, UIFeatureCategory } from 'src/enum/ui-feature';

/**
 * Catálogo de todas as features de UI disponíveis no sistema
 * Esta entidade armazena a definição de todas as telas, botões, componentes, etc.
 */
@Entity({ schema: 'public', name: 'ui-features' })
export class UIFeature {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: UIFeatureType })
  type: UIFeatureType;

  @Column({ type: 'enum', enum: UIFeatureCategory })
  category: UIFeatureCategory;

  /**
   * Key da feature pai (ex: um botão tem parentKey = 'freight.list')
   */
  @Column({ nullable: true })
  parentKey: string;

  /**
   * Se está visível/habilitada (true) ou oculta (false)
   */
  @Column({ default: true })
  isVisible: boolean;

  /**
   * Se esta feature está ativa no sistema
   */
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    icon?: string;
    color?: string;
    route?: string;
    tooltipText?: string;
    [key: string]: any;
  };


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
