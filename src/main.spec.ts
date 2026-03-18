describe('bootstrap', () => {
  const create = jest.fn();
  const morgan = jest.fn().mockReturnValue('morgan-middleware');

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

    await import('./main');
    await new Promise(process.nextTick);

    expect(create).toHaveBeenCalled();
    expect(enableCors).toHaveBeenCalled();
    expect(morgan).toHaveBeenCalledWith('dev');
    expect(use).toHaveBeenCalledWith('morgan-middleware');
    expect(listen).toHaveBeenCalledWith('4321');
  });
});
