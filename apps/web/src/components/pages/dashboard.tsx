"use client";

import { Button } from "antd";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  UserOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  FileAddOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

export function DashboardPage() {
  const router = useRouter();
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
        const response = await axios.get("http://localhost:3000/api/v1/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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
        await axios.post("http://localhost:3000/api/v1/auth/logout", {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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
              className="flex items-center gap-3 px-6 py-3 border-l-4 border-[#0b57d0] bg-white text-[#0b57d0] font-medium text-[15px]"
            >
              <FileTextOutlined className="text-lg" />
              Hồ sơ của tôi
            </Link>
            <Link
              href="/in-development"
              className="flex items-center gap-3 px-6 py-3 border-l-4 border-transparent text-[#4b5563] hover:bg-[#f3f4f6] font-medium text-[15px] transition-colors"
            >
              <CloudUploadOutlined className="text-lg" />
              Tạo mới hồ sơ
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-6 py-3 border-l-4 border-transparent text-[#4b5563] hover:bg-[#f3f4f6] font-medium text-[15px] transition-colors"
            >
              <UserOutlined className="text-lg" />
              Thông tin cá nhân
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-10 bg-white">
          <div className="max-w-[1000px]">
            {/* Header section */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">
                Quản lý Hồ sơ Đất đai
              </h1>
              <p className="text-[15px] text-[#4b5563]">
                Hệ thống lưu trữ và định danh tài sản số (NFT Red Book).
              </p>
            </div>

            {/* Top Grid: Upload & My NFTs */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 mb-12">
              {/* Left Column: Upload */}
              <div>
                <div className="border-b border-[#e1e2e4] pb-3 mb-4">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Tải lên hồ sơ mới
                  </h2>
                </div>
                <div className="border-2 border-dashed border-[#b2c5ff] bg-[#fcfdff] rounded-md p-8 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <div className="w-12 h-12 bg-[#0b57d0] text-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                    <FileAddOutlined className="text-xl" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#111827] mb-4">
                    Tạo hồ sơ đất đai
                  </h3>
                  <Button
                    type="primary"
                    className="!bg-[#0b57d0] hover:!bg-[#0842a0] !border-0 !rounded-sm !px-6 !font-medium"
                  >
                    Tạo mới
                  </Button>
                </div>
              </div>

              {/* Right Column: NFTs */}
              <div>
                <div className="border-b border-[#e1e2e4] pb-3 mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Sổ đỏ số của tôi
                  </h2>
                  <a
                    href="#"
                    className="text-[13px] font-bold text-[#0b57d0] uppercase tracking-wider hover:underline"
                  >
                    XEM TẤT CẢ
                  </a>
                </div>

                <div className="mt-4 flex flex-col items-center justify-center py-10 border border-dashed border-[#e1e2e4] rounded-md bg-[#f9fafb]">
                  <p className="text-[#6b7280] font-medium text-[14px]">Chưa có dữ liệu sổ đỏ số</p>
                </div>
              </div>
            </div>

            {/* Bottom Table: Document Status */}
            <div>
              <div className="border-b border-[#e1e2e4] pb-3 mb-4">
                <h2 className="text-lg font-bold text-[#111827]">
                  Trạng thái xác thực tài liệu
                </h2>
              </div>
              <div className="border border-[#e1e2e4] rounded-md overflow-hidden bg-white">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="bg-[#f9fafb] text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider border-b border-[#e1e2e4]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">MÃ TÀI LIỆU</th>
                      <th className="px-5 py-4 font-semibold">LOẠI GIẤY TỜ</th>
                      <th className="px-5 py-4 font-semibold">NGÀY NỘP</th>
                      <th className="px-5 py-4 font-semibold text-right">
                        TRẠNG THÁI BLOCKCHAIN
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2e4]">
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-[#6b7280] font-medium text-[14px]">
                        Chưa có dữ liệu tài liệu
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-6 border-t border-[#e1e2e4]">
              <p className="text-[11px] font-semibold tracking-widest text-[#9ca3af] uppercase">
                © 2024 CIVIC UTILITY SYSTEM | WEB3 REGISTRY PROTOCOL
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
