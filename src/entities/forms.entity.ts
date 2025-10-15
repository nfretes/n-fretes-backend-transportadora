import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'public', name: 'forms' })
export class Form {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  nome: string;

  @Column()
  whatsapp: string;

  @Column()
  cnpj: string;

  @Column({ default: false })
  served: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
