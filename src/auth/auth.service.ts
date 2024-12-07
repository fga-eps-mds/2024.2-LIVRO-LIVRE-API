import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; 
import { LoginAttemptsService } from './login-attempts.service';  // Importando o serviço de tentativas

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private loginAttemptsService: LoginAttemptsService,  // Injetando o serviço
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    // Verificar se o usuário atingiu o limite de tentativas falhas
    const isBlocked = await this.loginAttemptsService.isBlocked(email);
    if (isBlocked) {
      throw new ForbiddenException('Sua conta está temporariamente bloqueada. Tente novamente em 1 minuto.');
    }

    // Encontrar o usuário no banco
    const user = await this.usersRepository.createQueryBuilder().where({ email }).getOne();
    if (!user) {
      await this.loginAttemptsService.registerFailedAttempt(email); // Registrar tentativa falha
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // Comparar a senha fornecida com a armazenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.loginAttemptsService.registerFailedAttempt(email); // Registrar tentativa falha
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    //Caso a senha seja válida, gerar os tokens
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '60m' }); // Expira em 60 minutos
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' }); // Expira em 7 dias

    // Registrar uma tentativa de login bem-sucedida
    await this.loginAttemptsService.registerSuccessfulAttempt(email);

    return { accessToken, refreshToken };
  }
}
