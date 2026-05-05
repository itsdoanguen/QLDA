import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { authService } from '@/services/auth.service';
import type { UserProfile } from '@/types/auth';

/**
 * Hook quản lý profile user: fetch profile, logout, kiểm tra auth
 * Component chỉ cần: const { profile, loading, logout } = useProfile();
 */
export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        setError('Không thể tải thông tin người dùng');
        localStorage.removeItem('accessToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('challengeId');
    router.push('/');
  }, [router]);

  return { profile, loading, error, logout };
}

/**
 * Hook quản lý login flow: gửi CCCD → nhận challengeId
 */
export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (nationalId: string) => {
    if (!nationalId || nationalId.length !== 12) {
      message.error('Vui lòng nhập đúng số CCCD (12 chữ số)');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ nationalId });
      if (response?.challengeId) {
        sessionStorage.setItem('challengeId', response.challengeId);
        router.push('/auth_otp');
      } else {
        message.error('Lỗi: Không nhận được challengeId từ máy chủ.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      message.error(error?.response?.data?.message || error?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { login, loading };
}

/**
 * Hook quản lý OTP verification: verify OTP → nhận token → redirect dashboard
 */
export function useVerifyOtp() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyOtp = useCallback(async (challengeId: string, otp: string) => {
    if (!challengeId) {
      message.error('Lỗi: Không tìm thấy challengeId');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.verifyOtp({ challengeId, otp });
      if (response?.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        router.push('/dashboard');
      } else {
        message.error('Xác thực thất bại');
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      message.error(error?.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  return { verifyOtp, isSubmitting };
}
