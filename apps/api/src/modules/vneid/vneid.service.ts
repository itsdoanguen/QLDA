import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppEnv } from '../../config/env/env.schema';

@Injectable()
export class VneidService {
  private readonly logger = new Logger(VneidService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService<AppEnv>) {
    this.baseUrl = this.configService.get<string>('VNEID_BASE_URL') || '';
    this.apiKey = this.configService.get<string>('VNEID_API_KEY') || '';
  }

  private async request(path: string, payload: any) {
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${cleanBaseUrl}${cleanPath}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new HttpException(data, response.status);
      }

      if (data._testOtp) {
        this.logger.log(`[VNeID Sandbox] OTP received for challenge ${data.challengeId}: ${data._testOtp}`);
      }

      return data;
    } catch (error: any) {
      this.logger.error(`VNeID API Error at ${path}: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: 'VNeID Service Unavailable' }, 503);
    }
  }

  async startAuth(payload: { nationalId: string; fullName?: string; dateOfBirth?: string }) {
    return this.request('/mock-vneid/v1/auth/start', payload);
  }

  async verifyAuth(payload: { challengeId: string; otp: string }) {
    return this.request('/mock-vneid/v1/auth/verify', payload);
  }

  async resendOtp(challengeId: string) {
    return this.request('/mock-vneid/v1/auth/resend-otp', { challengeId });
  }

  async logoutAuth(jti: string) {
    return this.request('/mock-vneid/v1/auth/logout', { jti });
  }

  async verifyIdentity(nationalId: string) {
    return this.request('/mock-vneid/v1/verify-identity', { nationalId });
  }
}
