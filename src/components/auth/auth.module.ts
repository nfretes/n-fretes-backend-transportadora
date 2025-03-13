import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from 'src/libs/redisClient';
import { Company } from '@entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
})
export class AuthModule {}
