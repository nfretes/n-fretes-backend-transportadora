import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Admin } from '@entities/admin-users.entity';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from 'src/libs/redisClient';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
  exports: [AuthService],
})
export class AuthModule {}