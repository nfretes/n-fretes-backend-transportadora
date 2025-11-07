import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryColumn,
  Index,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { ContactCompany } from './contact-company.entity';
import { Freight } from './freight.entity';
import { SubscriptionCompany } from './subscription-company.entity';
import { CompanyUsersContacts } from './company-users-contacts.entity';
import { FreightRequest } from './freight-requests.entity';
import { FreightRoutes } from './freight-routes.entity';
import { ReviewUserDrive } from './review-users-drive.entity';
import { UsersFavoritesCompany } from './users-favorites-company.entity';
import { Transactions } from './transactions.entity';
import { CreditCard } from './credit-card.entity';

@Entity({ schema: 'public', name: 'company' })
export class Company {
  @PrimaryColumn({ default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  nameFantasy: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'json', nullable: true })
  phoneNumberJson?: { number?: string; contact?: string };

  @Column({ nullable: true })
  phoneContact: string;

  @Index({ unique: true })
  @Column({ nullable: true })
  cnpj: string;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  contractSocial: string;

  @Column({ type: 'json', nullable: true })
  socios: any;

  @Column({ nullable: true })
  transportCategory: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isSucess: boolean;

  @Column({ default: false })
  isOn: boolean;

  @Column({ nullable: true })
  antt: string;

  @Column({ nullable: true })
  accessIp: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  documentsUrl?: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  complement?: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  assas_id: string;

  @Column({ nullable: true })
  siimpUsername: string;

  @Column({ nullable: true })
  siimpPassword: string;

  @Column({ default: false })
  siimpIntegrationActive: boolean;

  @OneToMany(() => ContactCompany, (contact) => contact.company)
  contacts: ContactCompany[];

  @OneToMany(
    () => UsersFavoritesCompany,
    (userFavorites) => userFavorites.company,
  )
  usersFavoritesCompany: UsersFavoritesCompany[];

  @OneToMany(() => Freight, (freight) => freight.company)
  freights: Freight[];

  @OneToOne(() => SubscriptionCompany, (subscription) => subscription.company)
  subscription: SubscriptionCompany;

  @OneToMany(() => CompanyUsersContacts, (company) => company.contacts)
  CompanyUsersContacts: CompanyUsersContacts[];

  @OneToMany(() => FreightRequest, (freightRequest) => freightRequest.company)
  freightRequest: FreightRequest[];

  @OneToOne(() => FreightRoutes, (freightRoutes) => freightRoutes.company)
  freightRoutes: FreightRoutes;

  @OneToMany(
    () => ReviewUserDrive,
    (reviewUserDrive) => reviewUserDrive.company,
  )
  reviewUserDrive: ReviewUserDrive[];

  @OneToMany(() => Transactions, (transaction) => transaction.company)
  transactions: Transactions[];

  @OneToMany(() => CreditCard, (creditCard) => creditCard.company)
  creditCard: CreditCard[];
}
