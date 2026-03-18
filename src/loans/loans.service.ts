import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { LoanRecord } from '../common/types/data.types';
import { JsonDatabaseService } from '../data/json-database.service';

@Injectable()
export class LoansService {
  constructor(private readonly jsonDatabaseService: JsonDatabaseService) {}

  getLoans(role?: Role, status?: 'pending' | 'active') {
    let loans = this.jsonDatabaseService.getLoans();

    if (status) {
      if (!['pending', 'active'].includes(status)) {
        throw new BadRequestException(
          'Status filter must be either pending or active.',
        );
      }

      loans = loans.filter((loan) => loan.status === status);
    }

    return this.sanitizeLoans(loans, role);
  }

  getLoansByUserEmail(userEmail: string, role?: Role) {
    const loans = this.jsonDatabaseService
      .getLoans()
      .filter(
        (loan) => loan.applicant.email.toLowerCase() === userEmail.toLowerCase(),
      );

    return this.sanitizeLoans(loans, role);
  }

  getExpiredLoans(role?: Role) {
    const loans = this.jsonDatabaseService
      .getLoans()
      .filter((loan) => this.isExpired(loan.maturityDate));

    return this.sanitizeLoans(loans, role);
  }

  deleteLoan(loanId: string) {
    const loans = this.jsonDatabaseService.getLoans();
    const loanToDelete = loans.find((loan) => loan.id === loanId);

    if (!loanToDelete) {
      throw new NotFoundException('Loan not found.');
    }

    this.jsonDatabaseService.saveLoans(
      loans.filter((loan) => loan.id !== loanId),
    );

    return {
      message: 'Loan deleted successfully.',
      deletedLoan: loanToDelete,
    };
  }

  private sanitizeLoans(loans: LoanRecord[], role?: Role) {
    return loans.map((loan) => {
      if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
        return loan;
      }

      const { totalLoan, ...safeApplicant } = loan.applicant;

      return {
        ...loan,
        applicant: safeApplicant,
      };
    });
  }

  private isExpired(dateValue: string): boolean {
    const parsedDate = new Date(dateValue.replace(' ', 'T'));

    return !Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() < Date.now();
  }
}
