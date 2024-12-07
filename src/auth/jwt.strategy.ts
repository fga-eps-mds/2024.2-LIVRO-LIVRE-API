import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtContants } from './auth.constants';  // Definição da chave secreta

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extrai o token do cabeçalho Authorization
      secretOrKey: jwtContants.secret,  // A chave secreta definida em auth.constants.ts
    });
  }

  // Valida o payload do token
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };  // Retorna as informações do usuário a partir do token
  }
}
