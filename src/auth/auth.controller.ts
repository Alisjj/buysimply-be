import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException('Email and password are required.');
    }

    return this.authService.login(body.email, body.password);
  }

  @HttpCode(HttpStatus.OK)
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
