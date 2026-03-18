import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { LoanRecord } from '../common/types/data.types';
import { JsonDatabaseService } from '../data/json-database.service';
import { LoansService } from './loans.service';

describe('LoansService', () => {
  const loans: LoanRecord[] = [
    {
      id: 'loan-1',
      amount: '₦5,000',
      maturityDate: '2024-01-10 12:00:00',
      status: 'active',
      applicant: {
        name: 'Michael Brown',
        email: 'michaelbrown@example.com',
        telephone: '+123456789',
        totalLoan: '₦20,000',
      },
      createdAt: '2024-01-01 12:00:00',
    },
    {
      id: 'loan-2',
      amount: '₦7,000',
      maturityDate: '2026-12-10 12:00:00',
      status: 'pending',
      applicant: {
        name: 'Emily Johnson',
        email: 'emilyjohnson@example.com',
        telephone: '+198765432',
        totalLoan: '₦50,000',
      },
      createdAt: '2026-01-01 12:00:00',
    },
    {
      id: 'loan-3',
      amount: '₦9,000',
      maturityDate: '2023-05-10 12:00:00',
      status: 'pending',
      applicant: {
        name: 'Michael Brown',
        email: 'michaelbrown@example.com',
        telephone: '+123456789',
        totalLoan: '₦30,000',
      },
      createdAt: '2023-01-01 12:00:00',
    },
  ];

  let loansService: LoansService;
  let jsonDatabaseService: jest.Mocked<JsonDatabaseService>;

  beforeEach(() => {
    jsonDatabaseService = {
      getLoans: jest.fn().mockReturnValue(loans),
      saveLoans: jest.fn(),
    } as unknown as jest.Mocked<JsonDatabaseService>;

    loansService = new LoansService(jsonDatabaseService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hides totalLoan from staff users', () => {
    const result = loansService.getLoans(Role.STAFF);

    expect(result).toHaveLength(3);
    expect(result[0].applicant).not.toHaveProperty('totalLoan');
  });

  it('keeps totalLoan visible for admin users', () => {
    const result = loansService.getLoans(Role.ADMIN);

    expect(result[0].applicant).toHaveProperty('totalLoan', '₦20,000');
  });

  it('filters loans by status', () => {
    const result = loansService.getLoans(Role.STAFF, 'pending');

    expect(result).toHaveLength(2);
    expect(result.every((loan) => loan.status === 'pending')).toBe(true);
  });

  it('rejects unsupported status filters', () => {
    expect(() => loansService.getLoans(Role.STAFF, 'closed' as never)).toThrow(
      BadRequestException,
    );
  });

  it('returns loans for a specific applicant email', () => {
    const result = loansService.getLoansByUserEmail(
      'MICHAELBROWN@example.com',
      Role.STAFF,
    );

    expect(result).toHaveLength(2);
    expect(
      result.every(
        (loan) => loan.applicant.email === 'michaelbrown@example.com',
      ),
    ).toBe(true);
  });

  it('returns expired loans using maturity date', () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2025-01-01T00:00:00Z').getTime());

    const result = loansService.getExpiredLoans(Role.ADMIN);

    expect(result.map((loan) => loan.id)).toEqual(['loan-1', 'loan-3']);
  });

  it('deletes a loan and persists the updated dataset', () => {
    const result = loansService.deleteLoan('loan-2');

    expect(result).toEqual({
      message: 'Loan deleted successfully.',
      deletedLoan: loans[1],
    });
    expect(jsonDatabaseService.saveLoans).toHaveBeenCalledWith([
      loans[0],
      loans[2],
    ]);
  });

  it('throws when deleting a missing loan', () => {
    expect(() => loansService.deleteLoan('missing-loan')).toThrow(
      NotFoundException,
    );
  });
});
