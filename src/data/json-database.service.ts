import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { LoanRecord, StaffRecord } from '../common/types/data.types';

@Injectable()
export class JsonDatabaseService {
  private readonly defaultDataDirectory = this.resolveDefaultDataDirectory();
  private readonly dataDirectory = this.resolveDataDirectory();

  getStaffs(): StaffRecord[] {
    return this.readJsonFile<StaffRecord[]>('staffs.json');
  }

  getLoans(): LoanRecord[] {
    return this.readJsonFile<LoanRecord[]>('loans.json');
  }

  saveLoans(loans: LoanRecord[]): void {
    this.writeJsonFile('loans.json', loans);
  }

  private readJsonFile<T>(fileName: string): T {
    const filePath = this.ensureDataFile(fileName);

    try {
      return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
    } catch (error) {
      throw new InternalServerErrorException(
        `Unable to read ${fileName}: ${(error as Error).message}`,
      );
    }
  }

  private writeJsonFile(fileName: string, payload: unknown): void {
    const filePath = join(this.dataDirectory, fileName);

    try {
      writeFileSync(filePath, JSON.stringify(payload, null, 2));
    } catch (error) {
      throw new InternalServerErrorException(
        `Unable to save ${fileName}: ${(error as Error).message}`,
      );
    }
  }

  private resolveDataDirectory(): string {
    const configuredDirectory = process.env.DATA_DIR?.trim();

    if (configuredDirectory) {
      const directory = resolve(configuredDirectory);

      if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
      }

      return directory;
    }

    return this.defaultDataDirectory;
  }

  private resolveDefaultDataDirectory(): string {
    const candidates = [
      resolve(process.cwd(), 'data'),
      resolve(__dirname, '..', '..', 'data'),
      resolve(__dirname, '..', '..', '..', 'data'),
    ];

    const directory = candidates.find((candidate) => existsSync(candidate));

    if (!directory) {
      throw new InternalServerErrorException('Data directory could not be found.');
    }

    return directory;
  }

  private ensureDataFile(fileName: string): string {
    const filePath = join(this.dataDirectory, fileName);

    if (existsSync(filePath)) {
      return filePath;
    }

    const fallbackFilePath = join(this.defaultDataDirectory, fileName);

    if (!existsSync(fallbackFilePath)) {
      throw new InternalServerErrorException(`${fileName} could not be found.`);
    }

    if (this.dataDirectory !== this.defaultDataDirectory) {
      copyFileSync(fallbackFilePath, filePath);
      return filePath;
    }

    return fallbackFilePath;
  }
}
