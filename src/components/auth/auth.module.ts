import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Company } from '@entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
