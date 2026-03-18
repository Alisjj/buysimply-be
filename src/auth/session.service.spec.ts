import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('marks a token as revoked', () => {
    service.revokeToken('token-1', Math.floor(Date.now() / 1000) + 60);

    expect(service.isTokenRevoked('token-1')).toBe(true);
  });

  it('removes expired revoked tokens during cleanup', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-01').getTime());

    service.revokeToken('expired-token', Math.floor(Date.now() / 1000) - 1);

    expect(service.isTokenRevoked('expired-token')).toBe(false);
  });

  it('keeps revoked tokens without expiry until explicitly cleared elsewhere', () => {
    service.revokeToken('token-without-exp');

    expect(service.isTokenRevoked('token-without-exp')).toBe(true);
  });
});
