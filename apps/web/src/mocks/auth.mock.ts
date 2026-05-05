import type { UserProfile, LoginResponse, VerifyOtpResponse } from '@/types/auth';

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'usr_001',
  fullName: 'Nguyễn Văn A',
  citizenId: '079123456789',
  vneidNumber: '079123456789',
  email: 'nguyenvana@email.com',
  phone: '0901234567',
  address: '123 Nguyễn Huệ, Q.1, TP.HCM',
  avatarUrl: undefined,
  createdAt: '2024-01-15T08:00:00Z',
  vneid: {
    fullName: 'Nguyễn Văn A',
    nationalId: '079123456789',
    dateOfBirth: '1990-05-15',
    gender: 'Nam',
    placeOfResidence: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  },
};

export const MOCK_LOGIN_RESPONSE: LoginResponse = {
  challengeId: 'challenge_mock_12345',
  message: 'OTP đã được gửi thành công',
};

export const MOCK_VERIFY_OTP_RESPONSE: VerifyOtpResponse = {
  accessToken: 'mock_jwt_token_abc123_eyJhbGciOiJIUzI1NiJ9',
  refreshToken: 'mock_refresh_token_xyz789',
  expiresIn: 3600,
};
