import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaginationService } from '@components/pagination/pagination.service';

import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';

import { UsersContactCompanyService } from './users-contact.service';
import { UsersContactCompanyController } from './users-contact.controller';
import { UsersDrive } from '@entities/users-drive.entity';
import { FeatureLog } from '@entities/feature-logs.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyUsersContacts, UsersDrive, FeatureLog]),
  ],
  exports: [TypeOrmModule],
  controllers: [UsersContactCompanyController],
  providers: [UsersContactCompanyService, PaginationService],
})
export class UsersContactCompanyModule {}
