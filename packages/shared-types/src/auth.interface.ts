export type OtpChannel = 'sms' | 'email';

export interface LoginRequest {
  vneidNumber: string;
  otpCode: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SendOtpRequest {
  vneidNumber: string;
  channel: OtpChannel;
}

export interface VerifyOtpRequest {
  vneidNumber: string;
  otpCode: string;
}
