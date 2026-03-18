import { Role } from '../common/enums/role.enum';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

describe('LoansController', () => {
  let controller: LoansController;
  let loansService: jest.Mocked<LoansService>;

  beforeEach(() => {
    loansService = {
      getLoans: jest.fn(),
      getExpiredLoans: jest.fn(),
      getLoansByUserEmail: jest.fn(),
      deleteLoan: jest.fn(),
    } as unknown as jest.Mocked<LoansService>;

    controller = new LoansController(loansService);
  });

  it('returns all loans for the current user role', () => {
    loansService.getLoans.mockReturnValue([{ id: 'loan-1' }] as any);

    const result = controller.getLoans(
      { user: { role: Role.STAFF } } as any,
      'active',
    );

    expect(loansService.getLoans).toHaveBeenCalledWith(Role.STAFF, 'active');
    expect(result).toEqual({
      loans: [{ id: 'loan-1' }],
    });
  });

  it('returns expired loans for the current user role', () => {
    loansService.getExpiredLoans.mockReturnValue([{ id: 'loan-2' }] as any);

    const result = controller.getExpiredLoans({
      user: { role: Role.ADMIN },
    } as any);

    expect(loansService.getExpiredLoans).toHaveBeenCalledWith(Role.ADMIN);
    expect(result).toEqual({
      loans: [{ id: 'loan-2' }],
    });
  });

  it('returns loans for a specific applicant email', () => {
    loansService.getLoansByUserEmail.mockReturnValue([{ id: 'loan-3' }] as any);

    const result = controller.getLoansByUserEmail(
      { user: { role: Role.STAFF } } as any,
      'michaelbrown@example.com',
    );

    expect(loansService.getLoansByUserEmail).toHaveBeenCalledWith(
      'michaelbrown@example.com',
      Role.STAFF,
    );
    expect(result).toEqual({
      loans: [{ id: 'loan-3' }],
    });
  });

  it('deletes a loan by id', () => {
    loansService.deleteLoan.mockReturnValue({
      message: 'Loan deleted successfully.',
      deletedLoan: { id: 'loan-4' },
    } as any);

    const result = controller.deleteLoan('loan-4');

    expect(loansService.deleteLoan).toHaveBeenCalledWith('loan-4');
    expect(result).toEqual({
      message: 'Loan deleted successfully.',
      deletedLoan: { id: 'loan-4' },
    });
  });
});
