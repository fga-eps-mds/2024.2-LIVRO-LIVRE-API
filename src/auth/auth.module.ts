import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtContants } from './auth.constants';
import { User } from '../database/entities/user.entity';
import { JwtStrategy } from './jwt.strategy'; 
import { LoginAttemptsService } from './login-attempts.service'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: jwtContants.secret,
      signOptions: { expiresIn: '60s'},
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoginAttemptsService],
})
export class AuthModule {}
