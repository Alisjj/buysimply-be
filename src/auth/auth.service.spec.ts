import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/enums/role.enum';
import { JsonDatabaseService } from '../data/json-database.service';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

describe('AuthService', () => {
  const staffs = [
    {
      id: 1,
      name: 'Edwin John',
      email: 'edwinjohn@example.com',
      role: Role.SUPER_ADMIN,
      password: '12345Pass',
    },
    {
      id: 2,
      name: 'Jackson Page',
      email: 'jp@example.com',
      role: Role.ADMIN,
      password: '1234567Pass',
    },
  ];

  let authService: AuthService;
  let jsonDatabaseService: jest.Mocked<JsonDatabaseService>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionService: jest.Mocked<SessionService>;

  beforeEach(() => {
    jsonDatabaseService = {
      getStaffs: jest.fn().mockReturnValue(staffs),
    } as unknown as jest.Mocked<JsonDatabaseService>;

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    } as unknown as jest.Mocked<JwtService>;

    sessionService = {
      revokeToken: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    authService = new AuthService(
      jsonDatabaseService,
      jwtService,
      sessionService,
    );
  });

  it('logs in a matching staff member and returns a token', () => {
    const result = authService.login('JP@example.com', '1234567Pass');

    expect(result).toEqual({
      accessToken: 'signed-token',
      staff: {
        id: 2,
        name: 'Jackson Page',
        email: 'jp@example.com',
        role: Role.ADMIN,
      },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 2,
      email: 'jp@example.com',
      name: 'Jackson Page',
      role: Role.ADMIN,
    });
  });

  it('throws when credentials are invalid', () => {
    expect(() => authService.login('jp@example.com', 'wrong-password')).toThrow(
      UnauthorizedException,
    );
  });

  it('revokes the current token during logout', () => {
    authService.logout('token-123', 1_700_000_000);

    expect(sessionService.revokeToken).toHaveBeenCalledWith(
      'token-123',
      1_700_000_000,
    );
  });
});
