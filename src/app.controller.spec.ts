import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns the API health payload', () => {
    const controller = new AppController();
    const result = controller.getHealth();

    expect(result.message).toBe('Loan API is running.');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });
});
