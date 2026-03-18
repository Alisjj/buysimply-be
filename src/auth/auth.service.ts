import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StaffRecord } from '../common/types/data.types';
import { JsonDatabaseService } from '../data/json-database.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jsonDatabaseService: JsonDatabaseService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  login(email: string, password: string) {
    const staff = this.findMatchingStaff(email, password);

    if (!staff) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    };
  }

  logout(token: string, exp?: number) {
    this.sessionService.revokeToken(token, exp);
  }

  private findMatchingStaff(
    email: string,
    password: string,
  ): StaffRecord | undefined {
    return this.jsonDatabaseService
      .getStaffs()
      .find(
        (staff) =>
          staff.email.toLowerCase() === email.toLowerCase() &&
          staff.password === password,
      );
  }
}
