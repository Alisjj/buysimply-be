import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionService {
  private readonly revokedTokens = new Map<string, number | undefined>();

  revokeToken(token: string, exp?: number): void {
    this.revokedTokens.set(token, exp);
    this.cleanupExpiredTokens();
  }

  isTokenRevoked(token: string): boolean {
    this.cleanupExpiredTokens();
    return this.revokedTokens.has(token);
  }

  private cleanupExpiredTokens(): void {
    const nowInSeconds = Math.floor(Date.now() / 1000);

    for (const [token, exp] of this.revokedTokens.entries()) {
      if (exp && exp <= nowInSeconds) {
        this.revokedTokens.delete(token);
      }
    }
  }
}
