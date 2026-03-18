import { InternalServerErrorException } from '@nestjs/common';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { JsonDatabaseService } from './json-database.service';

describe('JsonDatabaseService', () => {
  const originalCwd = process.cwd();
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'json-db-service-'));
    mkdirSync(join(tempRoot, 'data'));
    writeFileSync(
      join(tempRoot, 'data', 'staffs.json'),
      JSON.stringify([{ id: 1, email: 'a@example.com' }]),
    );
    writeFileSync(
      join(tempRoot, 'data', 'loans.json'),
      JSON.stringify([{ id: 'loan-1', applicant: { email: 'a@example.com' } }]),
    );
    process.chdir(tempRoot);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempRoot, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('reads staff and loan records from the data directory', () => {
    const service = new JsonDatabaseService();

    expect(service.getStaffs()).toEqual([{ id: 1, email: 'a@example.com' }]);
    expect(service.getLoans()).toEqual([
      { id: 'loan-1', applicant: { email: 'a@example.com' } },
    ]);
  });

  it('writes updated loans back to disk', () => {
    const service = new JsonDatabaseService();
    const updatedLoans = [{ id: 'loan-2', amount: '₦9000' }];

    service.saveLoans(updatedLoans as any);

    expect(
      JSON.parse(readFileSync(join(tempRoot, 'data', 'loans.json'), 'utf-8')),
    ).toEqual(updatedLoans);
  });

  it('throws a helpful error when reading invalid JSON', () => {
    writeFileSync(join(tempRoot, 'data', 'staffs.json'), '{bad json');
    const service = new JsonDatabaseService();

    expect(() => service.getStaffs()).toThrow(InternalServerErrorException);
  });

  it('throws when no data directory can be found', () => {
    jest
      .spyOn(require('fs'), 'existsSync')
      .mockReturnValue(false);

    expect(() => new JsonDatabaseService()).toThrow(
      InternalServerErrorException,
    );
  });

  it('wraps file write failures in an internal server error', () => {
    const service = new JsonDatabaseService();
    const writeSpy = jest
      .spyOn(require('fs'), 'writeFileSync')
      .mockImplementation(() => {
        throw new Error('disk is full');
      });

    expect(() => service.saveLoans([{ id: 'loan-3' }] as any)).toThrow(
      InternalServerErrorException,
    );

    writeSpy.mockRestore();
  });
});
