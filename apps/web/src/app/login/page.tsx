"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, App } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { api } from "@/utils/api";

export default function LoginPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!nationalId || nationalId.length !== 12) {
      message.error("Vui lòng nhập đúng số CCCD (12 chữ số)");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/login?nationalId=${nationalId}`);
      if (response.data && response.data.challengeId) {
        sessionStorage.setItem("challengeId", response.data.challengeId);
        router.push(`/auth_otp`);
      } else {
        message.error("Lỗi: Không nhận được challengeId từ máy chủ.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      message.error(error?.response?.data?.message || error?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {/* Main Card */}
        <div className="w-full max-w-[440px] rounded-sm border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-[28px] font-bold text-slate-900">Đăng nhập hệ thống</h1>
          <p className="mt-2 text-[15px] text-slate-600">
            Vui lòng nhập số CCCD để bắt đầu xác thực
          </p>

          <div className="mt-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              SỐ CCCD
            </label>
            <Input
              size="large"
              placeholder="Nhập số CCCD (12 chữ số)"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="!h-12 !rounded-md"
              onPressEnter={handleContinue}
              maxLength={12}
            />
          </div>

          <Button
            type="primary"
            size="large"
            className="mt-6 !h-12 w-full !rounded-md !bg-[#0056D2] !text-base !font-medium hover:!bg-[#0046b0]"
            onClick={handleContinue}
            loading={loading}
          >
            Tiếp tục
          </Button>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-slate-600">
              <SafetyCertificateOutlined className="text-lg text-slate-700" />
              <span className="text-[15px]">Kết nối an toàn qua Cổng DVC Quốc gia</span>
            </div>
          </div>
        </div>

        {/* Brand below card */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <BuildingIcon />
          </div>
          <div className="text-left">
            <div className="text-[13px] font-bold tracking-widest text-[#003399]">
              URBANCONNECT
            </div>
            <div className="text-sm text-slate-600">Smart City Management</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-[13px] text-slate-500 sm:flex-row">
          <div>© 2024 Smart City Urban Management. All systems operational.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-slate-900">Contact Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function BuildingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#003399]">
      <path d="M4 20V6l7-3v17H4Zm10 0V3h6v17h-6ZM6 8h2v2H6V8Zm0 4h2v2H6v-2Zm0 4h2v2H6v-2Zm10-6h2v2h-2V8Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Z" />
    </svg>
  );
}
