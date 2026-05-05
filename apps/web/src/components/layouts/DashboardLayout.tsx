"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "antd";
import Link from "next/link";
import { api } from "@/utils/api";
import {
  UserOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        localStorage.removeItem("accessToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Logout error", error);
      }
    }
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("challengeId");
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600 font-medium">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#e1e2e4] flex items-center justify-between px-6 shrink-0 bg-white z-10 relative">
        <div className="text-[1.15rem] font-black tracking-tight text-[#0052cc]">
          Quản lý đô thị thông minh
        </div>
        <div className="flex items-center gap-6">
          <Link href="/wallet">
            <Button className="!rounded-sm !border-[#d1d5db] !text-[#374151] hover:!text-[#0052cc] hover:!border-[#0052cc] !font-medium">
              Check Wallet
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-[#4b5563]">Xin chào, {profile?.fullName || "Bạn"}</span>
            <div className="h-8 w-8 rounded-full bg-[#d1d5db] flex items-center justify-center text-white">
              <UserOutlined />
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="!text-[#4b5563] hover:!text-red-500 hover:!bg-red-50"
              title="Đăng xuất"
            />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[260px] bg-[#f8f9fa] border-r border-[#e1e2e4] flex flex-col shrink-0">
          <div className="p-6">
            <h2 className="text-[1.05rem] font-bold leading-tight text-[#0052cc] mb-1">
              Quản lý đô thị thông minh
            </h2>
          </div>

          <nav className="flex flex-col gap-1 mt-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-6 py-3 font-medium text-[15px] transition-colors ${
                pathname === "/dashboard"
                  ? "border-l-4 border-[#0b57d0] bg-white text-[#0b57d0]"
                  : "border-l-4 border-transparent text-[#4b5563] hover:bg-[#f3f4f6]"
              }`}
            >
              <FileTextOutlined className="text-lg" />
              Hồ sơ của tôi
            </Link>
            <Link
              href="/dashboard/create"
              className={`flex items-center gap-3 px-6 py-3 font-medium text-[15px] transition-colors ${
                pathname === "/dashboard/create"
                  ? "border-l-4 border-[#0b57d0] bg-white text-[#0b57d0]"
                  : "border-l-4 border-transparent text-[#4b5563] hover:bg-[#f3f4f6]"
              }`}
            >
              <CloudUploadOutlined className="text-lg" />
              Tạo mới hồ sơ
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-3 px-6 py-3 font-medium text-[15px] transition-colors ${
                pathname === "/profile"
                  ? "border-l-4 border-[#0b57d0] bg-white text-[#0b57d0]"
                  : "border-l-4 border-transparent text-[#4b5563] hover:bg-[#f3f4f6]"
              }`}
            >
              <UserOutlined className="text-lg" />
              Thông tin cá nhân
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-10 bg-white">
          <div className="max-w-[1000px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
