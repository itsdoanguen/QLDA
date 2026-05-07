"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Tag } from "antd";
import Link from "next/link";
import { api } from "@/utils/api";
import {
  UserOutlined,
  FileSearchOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ContainerOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

export function StaffLayout({ children }: { children: React.ReactNode }) {
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
        const data = response.data;
        
        // Security check: If not staff/admin, redirect to citizen dashboard
        if (data.role?.roleCode === 'CITIZEN') {
          router.push("/dashboard");
          return;
        }
        
        setProfile(data);
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
    return <div className="min-h-screen flex items-center justify-center text-slate-600 font-medium">Đang tải hệ thống quản trị...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fcfdfe]">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#e1e2e4] flex items-center justify-between px-6 shrink-0 bg-white z-20 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-[1.15rem] font-black tracking-tight text-[#0052cc]">
            HỆ THỐNG QUẢN TRỊ
          </div>
          <Tag color="blue" className="!m-0 font-bold">STAFF PORTAL</Tag>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[14px] font-bold text-[#111827] leading-none mb-1">{profile?.fullName}</div>
              <div className="text-[11px] text-[#6b7280] font-medium uppercase tracking-wider">{profile?.role?.roleName || "Cán bộ"}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#eef2ff] border border-[#d1daff] flex items-center justify-center text-[#0052cc]">
              <UserOutlined />
            </div>
            <div className="w-[1px] h-6 bg-[#e1e2e4] mx-1"></div>
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
        <aside className="w-[260px] bg-white border-r border-[#e1e2e4] flex flex-col shrink-0 z-10">
          <nav className="flex flex-col gap-1 mt-6">
            <Link
              href="/staff/dashboard"
              className={`flex items-center gap-3 px-6 py-3.5 font-semibold text-[14px] transition-all ${
                pathname === "/staff/dashboard"
                  ? "border-l-4 border-[#0b57d0] bg-[#f0f7ff] text-[#0b57d0]"
                  : "border-l-4 border-transparent text-[#4b5563] hover:bg-[#f8f9fa] hover:text-[#111827]"
              }`}
            >
              <DashboardOutlined className="text-lg" />
              Tổng quan hồ sơ
            </Link>
            <Link
              href="/staff/processing"
              className={`flex items-center gap-3 px-6 py-3.5 font-semibold text-[14px] transition-all ${
                pathname === "/staff/processing"
                  ? "border-l-4 border-[#0b57d0] bg-[#f0f7ff] text-[#0b57d0]"
                  : "border-l-4 border-transparent text-[#4b5563] hover:bg-[#f8f9fa] hover:text-[#111827]"
              }`}
            >
              <ContainerOutlined className="text-lg" />
              Xử lý hồ sơ
            </Link>
            <Link
              href="/staff/search"
              className={`flex items-center gap-3 px-6 py-3.5 font-semibold text-[14px] transition-all ${
                pathname === "/staff/search"
                  ? "border-l-4 border-[#0b57d0] bg-[#f0f7ff] text-[#0b57d0]"
                  : "border-l-4 border-transparent text-[#4b5563] hover:bg-[#f8f9fa] hover:text-[#111827]"
              }`}
            >
              <FileSearchOutlined className="text-lg" />
              Tra cứu & Xác minh
            </Link>
            <Link
              href="/staff/reports"
              className={`flex items-center gap-3 px-6 py-3.5 font-semibold text-[14px] transition-all ${
                pathname === "/staff/reports"
                  ? "border-l-4 border-[#0b57d0] bg-[#f0f7ff] text-[#0b57d0]"
                  : "border-l-4 border-transparent text-[#4b5563] hover:bg-[#f8f9fa] hover:text-[#111827]"
              }`}
            >
              <BarChartOutlined className="text-lg" />
              Báo cáo thống kê
            </Link>
          </nav>

          <div className="mt-auto p-6 border-t border-[#f3f4f6]">
            <div className="bg-[#f9fafb] p-4 rounded-lg border border-[#e1e2e4]">
              <div className="text-[11px] font-bold text-[#6b7280] uppercase mb-1">Cơ quan chủ quản</div>
              <div className="text-[12px] font-bold text-[#111827]">Sở Tài nguyên & Môi trường</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#fcfdfe] p-8">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
