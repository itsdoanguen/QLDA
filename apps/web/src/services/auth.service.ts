import { apiClient } from './api-client';
import type {
  LoginRequest,
  LoginResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UserProfile,
} from '@/types/auth';
import {
  MOCK_LOGIN_RESPONSE,
  MOCK_VERIFY_OTP_RESPONSE,
  MOCK_USER_PROFILE,
} from '@/mocks/auth.mock';

/** Toggle mock: khi BE chưa sẵn sàng, đặt NEXT_PUBLIC_USE_MOCK=true */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

/** Simulate network delay khi dùng mock để UX giống thật */
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const authService = {
  /**
   * Đăng nhập bằng số CCCD → nhận challengeId để verify OTP
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    if (USE_MOCK) return mockDelay(MOCK_LOGIN_RESPONSE);
    const res = await apiClient.post<LoginResponse>(
      `/auth/login?nationalId=${data.nationalId}`
    );
    return res.data;
  },

  /**
   * Xác thực OTP → nhận accessToken
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    if (USE_MOCK) return mockDelay(MOCK_VERIFY_OTP_RESPONSE);
    const res = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', data);
    return res.data;
  },

  /**
   * Lấy thông tin profile user hiện tại
   */
  async getProfile(): Promise<UserProfile> {
    if (USE_MOCK) return mockDelay(MOCK_USER_PROFILE);
    const res = await apiClient.get<UserProfile>('/auth/profile');
    return res.data;
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    if (USE_MOCK) return mockDelay(undefined, 300);
    await apiClient.post('/auth/logout');
  },
};
