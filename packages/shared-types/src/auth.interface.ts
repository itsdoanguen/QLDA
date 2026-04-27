export interface AuthLoginRequest {
  nationalId: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
}

export interface AuthLoginResponse {
  challengeId: string;
  expiresAt: string;
  _testOtp?: string;
  message: string;
}

export interface AuthVerifyOtpRequest {
  challengeId: string;
  otp: string;
}

export interface AuthVerifyOtpResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthSendOtpRequest {
  challengeId: string;
}

export interface AuthSendOtpResponse {
  challengeId: string;
  expiresAt: string;
  _testOtp?: string;
  message: string;
}

export interface AuthLogoutRequest {
  // token is taken from Authorization header, body is intentionally empty
  sandboxJti?: string; // Optional: forward to sandbox logout
}
