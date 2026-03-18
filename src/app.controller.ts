import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      message: 'Loan API is running.',
      timestamp: new Date().toISOString(),
    };
  }
}
