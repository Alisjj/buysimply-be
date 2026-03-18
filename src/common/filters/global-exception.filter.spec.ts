import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      json,
    });

    return {
      status,
      json,
      host: {
        switchToHttp: () => ({
          getResponse: () => ({
            status,
          }),
          getRequest: () => ({
            url: '/loans',
          }),
        }),
      } as ArgumentsHost,
    };
  };

  it('formats HttpException responses', () => {
    const { host, status, json } = createHost();

    filter.catch(
      new HttpException('Forbidden resource', HttpStatus.FORBIDDEN),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
        path: '/loans',
      }),
    );
  });

  it('falls back to internal server error for unknown exceptions', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('Boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Boom',
      }),
    );
  });

  it('preserves structured HttpException messages', () => {
    const { host, json } = createHost();

    filter.catch(
      new HttpException(
        { message: ['email is required', 'password is required'] },
        HttpStatus.BAD_REQUEST,
      ),
      host,
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['email is required', 'password is required'],
      }),
    );
  });
});
