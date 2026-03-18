import { Role } from '../enums/role.enum';

export interface StaffRecord {
  id: number;
  name: string;
  email: string;
  role: Role;
  password: string;
}

export interface LoanApplicant {
  name: string;
  email: string;
  telephone: string;
  totalLoan: string;
}

export interface LoanRecord {
  id: string;
  amount: string;
  maturityDate: string;
  status: 'pending' | 'active';
  applicant: LoanApplicant;
  createdAt: string;
}

export interface AuthTokenPayload {
  sub: number;
  email: string;
  name: string;
  role: Role;
  exp?: number;
  iat?: number;
}
