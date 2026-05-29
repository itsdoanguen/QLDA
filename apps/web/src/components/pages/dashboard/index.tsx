"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pagination } from "antd";
import Link from "next/link";
import { api } from "@/utils/api";
import {
  FileAddOutlined,
} from "@ant-design/icons";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  Draft: {
    label: "Bản nháp",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  Submitted: {
    label: "Đang chờ duyệt",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  CB_APPROVED: {
    label: "Đã duyệt (Cán bộ)",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "Needs Supplement": {
    label: "Cần bổ sung",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  Rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  Minted: {
    label: "Trên Blockchain",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentNftPage, setCurrentNftPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get("/land-records");
        setRecords(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setRecordsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
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
                  <Link href="/dashboard/create">
                    <Button
                      type="primary"
                      className="!bg-[#0b57d0] hover:!bg-[#0842a0] !border-0 !rounded-sm !px-6 !font-medium"
                    >
                      Tạo mới
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: NFTs */}
              <div>
                <div className="border-b border-[#e1e2e4] pb-3 mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Sổ đỏ số của tôi
                  </h2>
                  <Link
                    href="/dashboard/records"
                    className="text-[13px] font-bold text-[#0b57d0] uppercase tracking-wider hover:underline"
                  >
                    XEM TẤT CẢ
                  </Link>
                </div>

                {recordsLoading ? (
                  <div className="mt-4 flex flex-col items-center justify-center py-10 border border-[#e1e2e4] rounded-md bg-[#f9fafb]">
                    <p className="text-[#6b7280] font-medium text-[14px]">Đang tải dữ liệu...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="mt-4 flex flex-col items-center justify-center py-10 border border-dashed border-[#e1e2e4] rounded-md bg-[#f9fafb]">
                    <p className="text-[#6b7280] font-medium text-[14px]">Chưa có dữ liệu hồ sơ</p>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid gap-3">
                      {records
                        .filter((r) => r.status === 'CB_APPROVED' || r.status === 'Minted')
                        .slice((currentNftPage - 1) * pageSize, currentNftPage * pageSize)
                        .map((record) => {
                          const status = STATUS_MAP[record.status] || STATUS_MAP.Draft;
                          return (
                            <Link href={`/dashboard/records/${record.id}`} key={record.id}>
                              <div className="border border-[#e1e2e4] rounded-md p-4 bg-white hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="max-w-[70%]">
                                    <p className="font-semibold text-[14px] text-[#111827] truncate" title={record.address}>
                                      {record.address}
                                    </p>
                                  </div>
                                  <span className={`text-[11px] font-semibold px-2 py-1 rounded border ${status.className}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <div className="flex gap-4 text-[12px] text-[#6b7280]">
                                  <span>Tờ bản đồ: {record.plotNumber || 'N/A'}</span>
                                  <span>Thửa đất: {record.parcelNumber || 'N/A'}</span>
                                  <span>Diện tích: {record.area} m²</span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                    {records.filter((r) => r.status === 'CB_APPROVED' || r.status === 'Minted').length > pageSize && (
                      <div className="mt-4 flex justify-end">
                        <Pagination
                          current={currentNftPage}
                          pageSize={pageSize}
                          total={records.filter((r) => r.status === 'CB_APPROVED' || r.status === 'Minted').length}
                          onChange={(page) => setCurrentNftPage(page)}
                          showSizeChanger={false}
                          className="custom-pagination"
                          size="small"
                        />
                      </div>
                    )}
                  </>
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
                      <th className="px-5 py-4 font-semibold">ĐỊA CHỈ THỬA ĐẤT</th>
                      <th className="px-5 py-4 font-semibold">SỐ TỜ</th>
                      <th className="px-5 py-4 font-semibold">SỐ THỬA</th>
                      <th className="px-5 py-4 font-semibold">LOẠI ĐẤT</th>
                      <th className="px-5 py-4 font-semibold">NGÀY CẬP NHẬT</th>
                      <th className="px-5 py-4 font-semibold text-right">
                        TRẠNG THÁI
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
                        <td colSpan={6} className="px-5 py-8 text-center text-[#6b7280] font-medium text-[14px]">
                          Chưa có tài liệu nào
                        </td>
                      </tr>
                    ) : (
                      records
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((record) => {
                          const status = STATUS_MAP[record.status] || STATUS_MAP.Draft;
                          return (
                            <tr 
                              key={record.id} 
                              className="hover:bg-[#f9fafb] transition-colors cursor-pointer group"
                              onClick={() => router.push(`/dashboard/records/${record.id}`)}
                            >
                              <td className="px-5 py-4 text-[#111827] font-medium max-w-[200px] truncate group-hover:text-[#0b57d0]" title={record.address}>
                                {record.address}
                              </td>
                              <td className="px-5 py-4 text-[#374151]">
                                {record.plotNumber || "—"}
                              </td>
                              <td className="px-5 py-4 text-[#374151]">
                                {record.parcelNumber || "—"}
                              </td>
                              <td className="px-5 py-4 text-[#374151]">
                                {record.landType || "—"}
                              </td>
                              <td className="px-5 py-4 text-[#6b7280]">
                                {formatDate(record.updatedAt || record.createdAt)}
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
              
              {/* Pagination control */}
              {records.length > pageSize && (
                <div className="mt-4 flex justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={records.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-6 border-t border-[#e1e2e4]">
              <p className="text-[11px] font-semibold tracking-widest text-[#9ca3af] uppercase">
                © 2024 CIVIC UTILITY SYSTEM | WEB3 REGISTRY PROTOCOL
              </p>
            </footer>
    </>
  );
}
