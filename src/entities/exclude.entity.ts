import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ schema: 'public', name: 'exclude' })
export class Exclude {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  cnpj: string;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn()
  dataSolicitacao: Date;

  @Column({ default: false })
  jaExcluido: boolean;
}