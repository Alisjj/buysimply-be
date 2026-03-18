import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '../../auth/session.service';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionService: jest.Mocked<SessionService>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    sessionService = {
      isTokenRevoked: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<SessionService>;

    guard = new JwtAuthGuard(reflector, jwtService, sessionService);
  });

  const createContext = (authorization?: string) => {
    const request: Record<string, unknown> = {
      headers: {},
    };

    if (authorization) {
      request.headers = {
        authorization,
      };
    }

    return {
      request,
      context: {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as any,
    };
  };

  it('allows public routes without checking for a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const { context } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects requests without a bearer token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Bearer token is required.'),
    );
  });

  it('rejects revoked tokens', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    sessionService.isTokenRevoked.mockReturnValue(true);
    const { context } = createContext('Bearer revoked-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token has been revoked.'),
    );
  });

  it('verifies a valid token and attaches the payload to the request', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'edwinjohn@example.com',
      name: 'Edwin John',
      role: Role.SUPER_ADMIN,
    });
    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalled();
    expect(request.user).toEqual({
      sub: 1,
      email: 'edwinjohn@example.com',
      name: 'Edwin John',
      role: Role.SUPER_ADMIN,
    });
    expect(request.authToken).toBe('valid-token');
  });

  it('rejects invalid tokens', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));
    const { context } = createContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired token.'),
    );
  });
});
