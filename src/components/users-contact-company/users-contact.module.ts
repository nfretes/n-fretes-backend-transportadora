import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaginationService } from '@components/pagination/pagination.service';

import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import { Freight } from '@entities/freight.entity';

import { UsersContactCompanyService } from './users-contact.service';
import { UsersContactCompanyController } from './users-contact.controller';
import { UsersDrive } from '@entities/users-drive.entity';
import { FeatureLog } from '@entities/feature-logs.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyUsersContacts,
      UsersDrive,
      FeatureLog,
      ContactCompany,
      Freight,
    ]),
  ],
  exports: [TypeOrmModule],
  controllers: [UsersContactCompanyController],
  providers: [UsersContactCompanyService, PaginationService],
})
export class UsersContactCompanyModule {}
