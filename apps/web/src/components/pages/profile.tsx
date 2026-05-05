"use client";

import { Button } from "antd";
import Link from "next/link";
import {
  UserOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  LogoutOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useProfile } from "@/hooks/useAuth";

export function ProfilePage() {
  const { profile, loading, logout } = useProfile();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600 font-medium">Đang tải dữ liệu...</div>;
  }

  const vneid = profile?.vneid || {};

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    return `${day} / ${month} / ${year}`;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <header className="h-16 border-b border-[#e1e2e4] flex items-center justify-between px-6 shrink-0 bg-white z-10 relative">
        <div className="text-[1.15rem] font-black tracking-tight text-[#0052cc]">
          Quản lý đô thị thông minh
        </div>
        <div className="flex items-center gap-6">
          <Button className="!rounded-sm !border-[#d1d5db] !text-[#374151] hover:!text-[#0052cc] hover:!border-[#0052cc] !font-medium">
            Connect Wallet
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-[#4b5563]">Xin chào, {profile?.fullName || "Bạn"}</span>
            <div className="h-8 w-8 rounded-full bg-[#d1d5db] flex items-center justify-center text-white">
              <UserOutlined />
            </div>
            <Button type="text" icon={<LogoutOutlined />} onClick={logout}
              className="!text-[#4b5563] hover:!text-red-500 hover:!bg-red-50" title="Đăng xuất" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[260px] bg-[#f8f9fa] border-r border-[#e1e2e4] flex flex-col shrink-0">
          <div className="p-6">
            <h2 className="text-[1.05rem] font-bold leading-tight text-[#0052cc] mb-1">Quản lý đô thị thông minh</h2>
          </div>
          <nav className="flex flex-col gap-1 mt-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-6 py-3 border-l-4 border-transparent text-[#4b5563] hover:bg-[#f3f4f6] font-medium text-[15px] transition-colors">
              <FileTextOutlined className="text-lg" /> Hồ sơ của tôi
            </Link>
            <Link href="/in-development" className="flex items-center gap-3 px-6 py-3 border-l-4 border-transparent text-[#4b5563] hover:bg-[#f3f4f6] font-medium text-[15px] transition-colors">
              <CloudUploadOutlined className="text-lg" /> Tạo mới hồ sơ
            </Link>
            <Link href="/profile" className="flex items-center gap-3 px-6 py-3 border-l-4 border-[#0b57d0] bg-white text-[#0b57d0] font-medium text-[15px]">
              <UserOutlined className="text-lg" /> Thông tin cá nhân
            </Link>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-10 bg-[#fafafa]">
          <div className="max-w-[1000px]">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">Hồ sơ định danh</h1>
              <p className="text-[15px] text-[#4b5563]">Quản lý thông tin cá nhân và thiết lập bảo mật hệ thống.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white border border-[#e1e2e4] rounded-lg p-8 shadow-sm">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-20 h-20 bg-[#f3f4f6] rounded-md flex items-center justify-center text-[#9ca3af]">
                      <UserOutlined className="text-4xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-[#111827] mb-2">
                            {vneid.fullName || profile?.fullName || "Chưa cập nhật"}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-[#ecfdf5] px-2.5 py-1 rounded-[4px] border border-[#d1fae5] text-[#065f46] text-[12px] font-semibold">
                              <SafetyCertificateOutlined /> Đã xác thực VNeID
                            </span>
                            <span className="text-[#9ca3af] text-[13px] font-mono">Level 2</span>
                          </div>
                        </div>
                        <IdcardOutlined className="text-2xl text-[#d1d5db]" />
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-[#e1e2e4] w-full mb-8"></div>
                  <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                    <div>
                      <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">SỐ CCCD / ĐỊNH DANH</p>
                      <div className="bg-[#f9fafb] border border-[#e1e2e4] px-4 py-2.5 rounded-md font-mono text-[14px] text-[#4b5563]">
                        {vneid.nationalId || profile?.vneidNumber || "Chưa cập nhật"}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">NGÀY SINH</p>
                      <div className="text-[15px] text-[#111827] font-medium py-2.5">{formatDate(vneid.dateOfBirth)}</div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">GIỚI TÍNH</p>
                      <div className="text-[15px] text-[#111827] font-medium">{vneid.gender || "Chưa cập nhật"}</div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">QUỐC TỊCH</p>
                      <div className="text-[15px] text-[#111827] font-medium">Việt Nam</div>
                    </div>
                    <div className="col-span-2 mt-2">
                      <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">NƠI ĐĂNG KÝ THƯỜNG TRÚ</p>
                      <div className="bg-[#f9fafb] border border-[#e1e2e4] p-4 rounded-md text-[14px] text-[#374151] leading-relaxed">
                        {vneid.placeOfResidence || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white border border-[#e1e2e4] rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">THÔNG TIN LIÊN LẠC</h3>
                    <IdcardOutlined className="text-lg text-[#9ca3af]" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[12px] text-[#6b7280]">Số điện thoại</p>
                        <EditOutlined className="text-[#0b57d0] cursor-pointer hover:opacity-80" />
                      </div>
                      <p className="text-[15px] font-medium text-[#111827]">
                        {profile?.phone ? `+84 ${profile.phone.substring(1)}` : "+84 ••• ••• ••••"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#6b7280] mb-1">Thư điện tử</p>
                      <p className="text-[15px] font-medium text-[#111827] truncate">{profile?.email || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
