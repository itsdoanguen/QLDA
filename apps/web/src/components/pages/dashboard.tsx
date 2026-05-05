"use client";

import { Button } from "antd";
import Link from "next/link";
import {
  UserOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  FileAddOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useProfile } from "@/hooks/useAuth";
import { useLandRecords } from "@/hooks/useLandRecords";
import type { RecordStatus } from "@/types/land-record";

/** Map blockchain status → label hiển thị */
const STATUS_MAP: Record<RecordStatus, { label: string; className: string }> = {
  pending: {
    label: "Đang chờ",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  verified: {
    label: "Đã xác thực",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  on_chain: {
    label: "Trên Blockchain",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function DashboardPage() {
  // ✅ Dùng hooks thay vì gọi axios trực tiếp
  const { profile, loading, logout } = useProfile();
  const { records, loading: recordsLoading } = useLandRecords();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600 font-medium">Đang tải dữ liệu...</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
              onClick={logout}
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

                {records.filter((r) => r.blockchainStatus === "on_chain").length === 0 ? (
                  <div className="mt-4 flex flex-col items-center justify-center py-10 border border-dashed border-[#e1e2e4] rounded-md bg-[#f9fafb]">
                    <p className="text-[#6b7280] font-medium text-[14px]">Chưa có dữ liệu sổ đỏ số</p>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {records
                      .filter((r) => r.blockchainStatus === "on_chain")
                      .map((record) => (
                        <div
                          key={record.id}
                          className="border border-[#e1e2e4] rounded-md p-4 bg-white hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-[14px] text-[#111827]">{record.documentCode}</p>
                              <p className="text-[13px] text-[#6b7280] mt-1">{record.documentType}</p>
                            </div>
                            <span className="text-[11px] font-mono text-[#0b57d0] bg-[#eef2ff] px-2 py-1 rounded">
                              {record.nftTokenId}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
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
                    {recordsLoading ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-[#6b7280] font-medium text-[14px]">
                          Đang tải hồ sơ...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-[#6b7280] font-medium text-[14px]">
                          Chưa có dữ liệu tài liệu
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => {
                        const status = STATUS_MAP[record.blockchainStatus];
                        return (
                          <tr key={record.id} className="hover:bg-[#f9fafb] transition-colors">
                            <td className="px-5 py-4 font-mono text-[#111827] font-medium">
                              {record.documentCode}
                            </td>
                            <td className="px-5 py-4 text-[#374151]">
                              {record.documentType}
                            </td>
                            <td className="px-5 py-4 text-[#6b7280]">
                              {formatDate(record.submittedAt)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className={`inline-block px-2.5 py-1 rounded-[4px] border text-[12px] font-semibold ${status.className}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
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
