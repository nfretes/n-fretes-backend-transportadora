import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaginationService } from '@components/pagination/pagination.service';

import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';

import { UsersContactCompanyService } from './users-contact.service';
import { UsersContactCompanyController } from './users-contact.controller';
import { UsersDrive } from '@entities/users-drive.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CompanyUsersContacts, UsersDrive])],
  exports: [TypeOrmModule],
  controllers: [UsersContactCompanyController],
  providers: [UsersContactCompanyService, PaginationService],
})
export class UsersContactCompanyModule {}
