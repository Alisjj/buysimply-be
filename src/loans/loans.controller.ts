import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { LoansService } from './loans.service';

@Controller()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get('loans')
  getLoans(
    @Req() request: AuthenticatedRequest,
    @Query('status') status?: 'pending' | 'active',
  ) {
    return {
      loans: this.loansService.getLoans(request.user?.role, status),
    };
  }

  @Get('loans/expired')
  getExpiredLoans(@Req() request: AuthenticatedRequest) {
    return {
      loans: this.loansService.getExpiredLoans(request.user?.role),
    };
  }

  @Get('loans/:userEmail/get')
  getLoansByUserEmail(
    @Req() request: AuthenticatedRequest,
    @Param('userEmail') userEmail: string,
  ) {
    return {
      loans: this.loansService.getLoansByUserEmail(userEmail, request.user?.role),
    };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete('loan/:loanId/delete')
  deleteLoan(@Param('loanId') loanId: string) {
    return this.loansService.deleteLoan(loanId);
  }
}
