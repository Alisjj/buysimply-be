import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'Check API health status' })
  @ApiOkResponse({ description: 'API is available.' })
  @Get()
  getHealth() {
    return {
      message: 'Loan API is running.',
      timestamp: new Date().toISOString(),
    };
  }
}
