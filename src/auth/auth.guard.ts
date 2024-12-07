import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtContants } from './auth.constants';
import { LoginAttemptsService } from './login-attempts.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private loginAttemptsService: LoginAttemptsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: jwtContants.secret
        }
      );
      request['user'] = payload;

      // Verificar se o usuário está bloqueado
      const isBlocked = await this.loginAttemptsService.isBlocked(payload.email);
      if (isBlocked) {
        throw new UnauthorizedException('Sua conta está temporariamente bloqueada.');
      }

    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}