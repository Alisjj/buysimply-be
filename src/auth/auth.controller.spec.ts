import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(authService);
  });

  it('logs in when email and password are provided', () => {
    authService.login.mockReturnValue({
      accessToken: 'token',
      staff: {
        id: 1,
        name: 'Edwin John',
        email: 'edwinjohn@example.com',
        role: Role.SUPER_ADMIN,
      },
    });

    const result = controller.login({
      email: 'edwinjohn@example.com',
      password: '12345Pass',
    });

    expect(authService.login).toHaveBeenCalledWith(
      'edwinjohn@example.com',
      '12345Pass',
    );
    expect(result.accessToken).toBe('token');
  });

  it('rejects login without complete credentials', () => {
    expect(() => controller.login({ email: 'edwinjohn@example.com' })).toThrow(
      UnauthorizedException,
    );
  });

  it('logs out with the request token and payload expiry', () => {
    const result = controller.logout({
      authToken: 'token-123',
      user: {
        sub: 1,
        email: 'edwinjohn@example.com',
        name: 'Edwin John',
        role: Role.SUPER_ADMIN,
        exp: 2_000_000_000,
      },
    } as any);

    expect(authService.logout).toHaveBeenCalledWith(
      'token-123',
      2_000_000_000,
    );
    expect(result).toEqual({
      message: 'Logged out successfully.',
    });
  });

  it('rejects logout without an authenticated request', () => {
    expect(() => controller.logout({} as any)).toThrow(UnauthorizedException);
  });
});
