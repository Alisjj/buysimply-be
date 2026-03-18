import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a staff member and issue a JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          example: 'jp@example.com',
        },
        password: {
          type: 'string',
          example: '1234567Pass',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Login successful.' })
  @ApiUnauthorizedResponse({
    description: 'Email/password is missing or invalid.',
  })
  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException('Email and password are required.');
    }

    return this.authService.login(body.email, body.password);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current JWT session' })
  @ApiOkResponse({ description: 'Logout successful.' })
  @ApiUnauthorizedResponse({
    description: 'A valid authenticated request is required.',
  })
  @Post('logout')
  logout(@Req() request: AuthenticatedRequest) {
    const token = request.authToken;

    if (!token || !request.user) {
      throw new UnauthorizedException('A valid logged-in session is required.');
    }

    this.authService.logout(token, request.user.exp);

    return {
      message: 'Logged out successfully.',
    };
  }
}
