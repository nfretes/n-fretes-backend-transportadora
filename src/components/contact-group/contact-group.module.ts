import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactGroup } from '@entities/contact-group.entity';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { ContactGroupService } from './contact-group.service';
import { ContactGroupController } from './contact-group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContactGroup, CompanyUsersContacts])],
  exports: [TypeOrmModule],
  controllers: [ContactGroupController],
  providers: [ContactGroupService],
})
export class ContactGroupModule {}
