import { Injectable } from '@nestjs/common';

@Injectable()
export class VneidService {
  private readonly duplicates = new Set<string>(['001122334455', '123456789012']);

  verifyIdentity(cccd: string, fullName?: string): {
    cccd: string;
    isValid: boolean;
    matchScore: number;
    reason?: string;
  } {
    const isValidPattern = /^\d{12}$/.test(cccd);
    if (!isValidPattern) {
      return {
        cccd,
        isValid: false,
        matchScore: 0,
        reason: 'Invalid CCCD format.',
      };
    }

    if (cccd.endsWith('000')) {
      return {
        cccd,
        isValid: false,
        matchScore: 45,
        reason: 'CCCD blocked by deterministic sandbox rule.',
      };
    }

    const score = fullName && fullName.trim().length > 0 ? 98 : 90;
    return {
      cccd,
      isValid: true,
      matchScore: score,
    };
  }

  checkDuplicate(cccd: string): { cccd: string; isDuplicate: boolean } {
    return {
      cccd,
      isDuplicate: this.duplicates.has(cccd),
    };
  }

  getProfile(cccd: string): {
    cccd: string;
    fullName: string;
    dob: string;
    address: string;
  } {
    return {
      cccd,
      fullName: `Citizen ${cccd.slice(-4)}`,
      dob: '1990-01-01',
      address: 'Ho Chi Minh City, Viet Nam',
    };
  }
}
