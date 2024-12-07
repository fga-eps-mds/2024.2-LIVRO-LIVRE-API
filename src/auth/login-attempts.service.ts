import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginAttemptsService {
  private readonly attemptsMap = new Map<string, { count: number, lastAttempt: number }>();

  private readonly MAX_ATTEMPTS = 5; // Número máximo de tentativas falhas
  private readonly BLOCK_TIME = 60 * 2000; // Tempo de bloqueio em milissegundos (2 minutos)

  // Verificar se o usuário está bloqueado
  async isBlocked(email: string): Promise<boolean> {
    const attempts = this.attemptsMap.get(email);
    if (!attempts) return false;

    const currentTime = Date.now();
    const isBlocked = (attempts.count >= this.MAX_ATTEMPTS) && (currentTime - attempts.lastAttempt < this.BLOCK_TIME);
    return isBlocked;
  }

  // Registrar uma tentativa falha
  async registerFailedAttempt(email: string): Promise<void> {
    const currentTime = Date.now();
    const attempts = this.attemptsMap.get(email) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = currentTime;
    this.attemptsMap.set(email, attempts);
  }

  // Registrar uma tentativa bem-sucedida
  async registerSuccessfulAttempt(email: string): Promise<void> {
    this.attemptsMap.set(email, { count: 0, lastAttempt: Date.now() });
  }
}
