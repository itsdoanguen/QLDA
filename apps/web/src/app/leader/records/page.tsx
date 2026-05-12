"use client";

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Space, App } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export default function LeaderRecordsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch ONLY pending records for the leader
      const response = await api.get('/approvals/pending');
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch pending approvals", error);
      message.error("Không thể tải danh sách hồ sơ chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <span className="font-mono font-bold">HS-{id.toString().padStart(4, '0')}</span>,
    },
    {
      title: 'Loại hồ sơ',
      dataIndex: 'landType',
      key: 'landType',
      render: (text: string) => text || "Cấp mới GCN",
    },
    {
      title: 'Chủ sở hữu',
      dataIndex: ['owner', 'fullName'],
      key: 'owner',
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Diện tích',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => `${area} m²`,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => router.push(`/leader/processing/${record.id}`)}
          className="bg-[#0c56d0] hover:bg-blue-700 font-bold"
        >
          Ký Duyệt
        </Button>
      ),
    },
  ];

  const filteredData = data.filter((item: any) => 
    item.address?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.owner?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.id.toString().includes(searchText)
  );

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách Hồ sơ chờ Phê duyệt</h1>
          <p className="text-gray-500">Hiển thị toàn bộ hồ sơ đã qua thẩm định của Cán bộ</p>
        </div>
        <Input
          placeholder="Tìm kiếm theo địa chỉ, tên..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="max-w-sm h-10 rounded-lg shadow-sm"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 15 }}
          className="leader-table"
        />
      </div>
    </div>
  );
}
