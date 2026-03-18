import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { LoansService } from './loans.service';

@ApiTags('Loans')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Bearer token is required.' })
@Controller()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @ApiOperation({ summary: 'Fetch all loans or filter them by status' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'active'],
    description: 'Optional loan status filter.',
  })
  @ApiOkResponse({
    description: 'Loans returned successfully.',
  })
  @Get('loans')
  getLoans(
    @Req() request: AuthenticatedRequest,
    @Query('status') status?: 'pending' | 'active',
  ) {
    return {
      loans: this.loansService.getLoans(request.user?.role, status),
    };
  }

  @ApiOperation({ summary: 'Fetch loans with maturity dates in the past' })
  @ApiOkResponse({
    description: 'Expired loans returned successfully.',
  })
  @Get('loans/expired')
  getExpiredLoans(@Req() request: AuthenticatedRequest) {
    return {
      loans: this.loansService.getExpiredLoans(request.user?.role),
    };
  }

  @ApiOperation({ summary: 'Fetch all loans for a specific applicant email' })
  @ApiParam({
    name: 'userEmail',
    description: 'Applicant email address.',
    example: 'michaelbrown@example.com',
  })
  @ApiOkResponse({
    description: 'Matching user loans returned successfully.',
  })
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
  @ApiOperation({ summary: 'Delete a loan by id (super admin only)' })
  @ApiParam({
    name: 'loanId',
    description: 'Loan identifier.',
    example: '900199',
  })
  @ApiOkResponse({ description: 'Loan deleted successfully.' })
  @ApiForbiddenResponse({
    description: 'Only super admins can delete loans.',
  })
  @Delete('loan/:loanId/delete')
  deleteLoan(@Param('loanId') loanId: string) {
    return this.loansService.deleteLoan(loanId);
  }
}
