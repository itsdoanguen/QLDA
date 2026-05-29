"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Pagination } from "antd";
import { api } from "@/utils/api";
import { SearchOutlined, EnvironmentOutlined, LayoutOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Option } = Select;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  Draft: { label: "Bản nháp", className: "bg-gray-50 text-gray-700 border-gray-200" },
  Submitted: { label: "Đang chờ duyệt", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CB_APPROVED: { label: "Đã duyệt (Cán bộ)", className: "bg-blue-50 text-blue-700 border-blue-200" },
  "Needs Supplement": { label: "Cần bổ sung", className: "bg-orange-50 text-orange-700 border-orange-200" },
  Rejected: { label: "Từ chối", className: "bg-red-50 text-red-700 border-red-200" },
  Minted: { label: "Trên Blockchain", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export function UserRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get("/land-records");
        setRecords(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="animate-fade-in max-w-[1200px] mx-auto pb-24">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">
          Hồ sơ số của tôi
        </h1>
        <p className="text-[15px] text-[#4b5563]">
          Quản lý toàn bộ hồ sơ đất đai và tài sản số của bạn trên nền tảng.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[300px]">
          <Input
            size="large"
            placeholder="Tìm kiếm theo địa chỉ..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select
            size="large"
            defaultValue="all"
            className="w-full"
            onChange={(val) => setStatusFilter(val)}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="Minted">Trên Blockchain</Option>
            <Option value="CB_APPROVED">Đã duyệt (Cán bộ)</Option>
            <Option value="Submitted">Đang chờ duyệt</Option>
            <Option value="Draft">Bản nháp</Option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#0b57d0] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <LayoutOutlined className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ nào</h3>
          <p className="text-gray-500">Bạn chưa có hồ sơ nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRecords.map((record) => {
            const status = STATUS_MAP[record.status] || STATUS_MAP.Draft;
            return (
              <Link href={`/dashboard/records/${record.id}`} key={record.id}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${status.className}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{formatDate(record.updatedAt || record.createdAt)}</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0b57d0] transition-colors leading-snug">
                      {record.address || "Chưa cập nhật địa chỉ"}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
                      <EnvironmentOutlined className="text-[#0b57d0]" />
                      <span>Sổ đỏ số</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 grid grid-cols-3 gap-2 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Tờ bản đồ</div>
                      <div className="text-sm font-semibold text-gray-900">{record.plotNumber || '—'}</div>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Thửa đất</div>
                      <div className="text-sm font-semibold text-gray-900">{record.parcelNumber || '—'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Diện tích</div>
                      <div className="text-sm font-semibold text-gray-900">{record.area ? `${record.area}m²` : '—'}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination control */}
      {filteredRecords.length > pageSize && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredRecords.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
}
