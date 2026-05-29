"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Button, Tag, Modal, Form, Input, InputNumber, App, Space } from "antd";
import { PlusOutlined, SwapOutlined, EyeOutlined } from "@ant-design/icons";
import { api } from "@/utils/api";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Draft: { label: "Bản nháp", color: "default" },
  Buyer_Signed: { label: "Bên mua đã ký", color: "blue" },
  Seller_Signed: { label: "Bên bán đã ký", color: "cyan" },
  Pending_Tax: { label: "Chờ thuế / Chuyển nhượng", color: "orange" },
  Completed: { label: "Hoàn tất", color: "green" },
  Cancelled: { label: "Đã hủy", color: "red" },
};

export function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [txRes, profileRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/auth/profile")
      ]);
      setTransactions(txRes.data);
      setProfile(profileRes.data);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      message.error(error.response?.data?.message || "Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchParams]);

  const columns = [
    {
      title: "MÃ GIAO DỊCH",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span className="font-mono font-bold">TX-{id.toString().padStart(4, "0")}</span>,
    },
    {
      title: "TOKEN ID THỬA ĐẤT",
      dataIndex: "tokenId",
      key: "tokenId",
      render: (tokenId: string) => <Tag color="blue" className="font-mono font-semibold">#{tokenId}</Tag>,
    },
    {
      title: "VAI TRÒ CỦA BẠN",
      key: "role",
      render: (_: any, record: any) => {
        const isBuyer = profile?.id === record.buyerId;
        return (
          <Tag color={isBuyer ? "geekblue" : "purple"} className="!font-medium">
            {isBuyer ? "BÊN MUA" : "BÊN BÁN"}
          </Tag>
        );
      },
    },
    {
      title: "GIÁ TRỊ (VND)",
      dataIndex: "contractPrice",
      key: "contractPrice",
      render: (price: number) => <span className="font-semibold text-gray-900">{price.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const conf = STATUS_MAP[status] || STATUS_MAP.Draft;
        return <Tag color={conf.color} className="!font-medium">{conf.label}</Tag>;
      },
    },
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          size="small"
          onClick={() => router.push(`/dashboard/transactions/${record.id}`)}
          className="!rounded-md"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">
            Giao dịch chuyển nhượng
          </h1>
          <p className="text-[15px] text-[#4b5563]">
            Quản lý, theo dõi và thực hiện ký số các hợp đồng mua bán, chuyển quyền sở hữu Sổ đỏ số Land NFT.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/dashboard/transactions/create")}
          className="!bg-[#0c56d0] hover:!bg-blue-700 !font-semibold !h-11 !rounded-lg"
        >
          Khởi tạo giao dịch mới
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#e1e2e4] rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="[&_.ant-table-thead_th]:!bg-[#f9fafb] [&_.ant-table-thead_th]:!text-[11px] [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!text-[#6b7280] [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider"
        />
      </div>
    </div>
  );
}
