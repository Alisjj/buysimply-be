describe('bootstrap', () => {
  const create = jest.fn();
  const morgan = jest.fn().mockReturnValue('morgan-middleware');
  const build = jest.fn().mockReturnValue('swagger-config');
  const setTitle = jest.fn().mockReturnThis();
  const setDescription = jest.fn().mockReturnThis();
  const setVersion = jest.fn().mockReturnThis();
  const addBearerAuth = jest.fn().mockReturnThis();
  const createDocument = jest.fn().mockReturnValue('swagger-document');
  const setup = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.PORT = '4321';
  });

  afterEach(() => {
    delete process.env.PORT;
  });

  it('creates the Nest app and wires global middleware', async () => {
    const enableCors = jest.fn();
    const use = jest.fn();
    const listen = jest.fn().mockResolvedValue(undefined);

    create.mockResolvedValue({
      enableCors,
      use,
      listen,
    });

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create,
      },
    }));
    jest.doMock('morgan', () => morgan);
    jest.doMock('@nestjs/swagger', () => ({
      ApiBearerAuth: () => () => undefined,
      ApiBody: () => () => undefined,
      ApiForbiddenResponse: () => () => undefined,
      ApiOkResponse: () => () => undefined,
      ApiOperation: () => () => undefined,
      ApiParam: () => () => undefined,
      ApiQuery: () => () => undefined,
      ApiTags: () => () => undefined,
      ApiUnauthorizedResponse: () => () => undefined,
      DocumentBuilder: jest.fn().mockImplementation(() => ({
        setTitle,
        setDescription,
        setVersion,
        addBearerAuth,
        build,
      })),
      SwaggerModule: {
        createDocument,
        setup,
      },
    }));

    await import('./main');
    await new Promise(process.nextTick);

    expect(create).toHaveBeenCalled();
    expect(enableCors).toHaveBeenCalled();
    expect(morgan).toHaveBeenCalledWith('dev');
    expect(use).toHaveBeenCalledWith('morgan-middleware');
    expect(setTitle).toHaveBeenCalledWith('Loan Management API');
    expect(setDescription).toHaveBeenCalledWith(
      'REST API for staff authentication and loan management.',
    );
    expect(setVersion).toHaveBeenCalledWith('1.0.0');
    expect(addBearerAuth).toHaveBeenCalled();
    expect(build).toHaveBeenCalled();
    expect(createDocument).toHaveBeenCalled();
    expect(setup).toHaveBeenCalledWith(
      'docs',
      expect.any(Object),
      'swagger-document',
      {
        swaggerOptions: {
          persistAuthorization: true,
        },
      },
    );
    expect(listen).toHaveBeenCalledWith('4321');
  });
});
