// ===== REQUEST TYPES =====

export interface LoginRequest {
  /** Số CCCD từ VNeID */
  nationalId: string;
}

export interface VerifyOtpRequest {
  challengeId: string;
  otp: string;
}

// ===== RESPONSE TYPES =====

export interface LoginResponse {
  challengeId: string;
  message?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

/** VNeID identity data nested within user profile */
export interface VNeIdProfile {
  fullName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  placeOfResidence?: string;
}

export interface UserProfile {
  id?: string;
  fullName?: string;
  citizenId?: string;
  vneidNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  createdAt?: string;
  /** VNeID detailed identity data */
  vneid?: VNeIdProfile;
}
