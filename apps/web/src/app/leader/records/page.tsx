"use client";

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Select, Space, App } from 'antd';
import { SearchOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Draft: { label: "Bản nháp", color: "default" },
  Submitted: { label: "Đang chờ duyệt", color: "processing" },
  CB_APPROVED: { label: "Đã duyệt (Cán bộ)", color: "cyan" },
  "Needs Supplement": { label: "Cần bổ sung", color: "warning" },
  Rejected: { label: "Từ chối", color: "error" },
  "Leader Signed": { label: "Lãnh đạo đã ký", color: "blue" },
  Minted: { label: "Trên Blockchain", color: "green" },
};

export default function LeaderRecordsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all records in the system for the leader
      const response = await api.get('/land-records/all');
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch records", error);
      message.error("Không thể tải danh sách hồ sơ đất đai");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'MÃ HỒ SƠ',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <span className="font-mono font-bold">HS-{id.toString().padStart(4, '0')}</span>,
    },
    {
      title: 'TOKEN ID',
      dataIndex: 'tokenId',
      key: 'tokenId',
      render: (tokenId: string, record: any) => {
        if (record.status === 'Minted') {
          return tokenId ? <Tag color="blue" className="font-mono font-bold">#{tokenId}</Tag> : <Tag color="default" className="font-mono">Chờ Mint</Tag>;
        }
        return <span className="text-gray-400">—</span>;
      }
    },
    {
      title: 'LOẠI HỒ SƠ',
      dataIndex: 'landType',
      key: 'landType',
      render: (text: string) => text || "Cấp mới GCN",
    },
    {
      title: 'CHỦ SỞ HỮU',
      dataIndex: ['owner', 'fullName'],
      key: 'owner',
      render: (text: string) => <span className="font-semibold text-gray-950">{text || "N/A"}</span>,
    },
    {
      title: 'ĐỊA CHỈ THỬA ĐẤT',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'DIỆN TÍCH',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => `${area} m²`,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const conf = STATUS_MAP[status] || STATUS_MAP.Draft;
        return <Tag color={conf.color} className="!font-medium">{conf.label}</Tag>;
      },
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => {
        const isPendingSign = record.status === 'CB_APPROVED';
        return (
          <Button 
            type={isPendingSign ? "primary" : "default"}
            icon={<EyeOutlined />} 
            onClick={() => router.push(`/leader/processing/${record.id}`)}
            className={`!font-bold !text-xs !rounded-md ${
              isPendingSign 
                ? '!bg-[#0c56d0] hover:!bg-blue-700 !border-none !text-white' 
                : 'hover:!text-[#0c56d0] hover:!border-[#0c56d0]'
            }`}
          >
            {isPendingSign ? "KÝ DUYỆT" : "CHI TIẾT"}
          </Button>
        );
      },
    },
  ];

  // Filtering Logic
  const filteredData = data.filter((item: any) => {
    // 1. Search text filter
    const matchesSearch = 
      item.address?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.owner?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id.toString().includes(searchText) ||
      item.tokenId?.toString().includes(searchText);

    // 2. Status filter
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Header & Filter options */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Hồ sơ đất đai hệ thống</h1>
          <p className="text-[15px] text-gray-500">Xem và quản lý tất cả các hồ sơ đăng ký đất đai của công dân trong hệ thống</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48 h-10 [&_.ant-select-selector]:!rounded-lg"
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          >
            <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
            <Select.Option value="Submitted">Đang chờ duyệt (Cán bộ 1)</Select.Option>
            <Select.Option value="CB_APPROVED">Chờ ký duyệt (Lãnh đạo)</Select.Option>
            <Select.Option value="Leader Signed">Chờ đúc NFT</Select.Option>
            <Select.Option value="Minted">Đã cấp Sổ đỏ NFT</Select.Option>
            <Select.Option value="Needs Supplement">Cần bổ sung</Select.Option>
            <Select.Option value="Rejected">Đã từ chối</Select.Option>
            <Select.Option value="Draft">Bản nháp</Select.Option>
          </Select>

          <Input
            placeholder="Tìm theo địa chỉ, tên, Token ID..."
            prefix={<SearchOutlined className="text-gray-400 mr-2" />}
            className="w-72 h-10 rounded-lg shadow-sm"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 12 }}
          className="[&_.ant-table-thead_th]:!bg-[#f9fafb] [&_.ant-table-thead_th]:!text-[11px] [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!text-[#6b7280] [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider"
        />
      </div>
    </div>
  );
}
