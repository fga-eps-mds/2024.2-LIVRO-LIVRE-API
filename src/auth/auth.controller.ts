import { Body, Controller, Get, Post, Request, UseGuards, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { AuthGuard } from './auth.guard';
import { LoginAttemptsService } from './login-attempts.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private loginAttemptsService: LoginAttemptsService,
  ) { }

  @Post('login')
  async signIn(@Body() body: SignInDto) {
    // Verificar se o usuário está bloqueado
    const isBlocked = await this.loginAttemptsService.isBlocked(body.email);
    if (isBlocked) {
      throw new Error('Sua conta está temporariamente bloqueada. Tente novamente em 2 minutos.');
    }

    //Realizar o login no AuthService
    const result = await this.authService.signIn(body.email, body.password);

    //Registrar uma tentativa de login bem-sucedida
    await this.loginAttemptsService.registerSuccessfulAttempt(body.email);

    return result;
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  async logout(@Request() req, @Response() res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return res.status(200).send({ message: 'Logout bem-sucedido' });
  }
}
