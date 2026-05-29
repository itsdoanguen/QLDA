"use client";

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Modal, App, Card, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { api } from '@/utils/api';

interface RecoveryRequest {
  id: number;
  userId: number;
  userFullName: string;
  userVneidNumber: string;
  oldWalletAddress: string;
  newWalletAddress: string;
  status: string;
  chainRequestId: number;
  createdAt: string;
}

export default function WalletRecoveryManagement() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { modal, message } = App.useApp();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallet/recovery-requests');
      setRequests(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch recovery requests:', error);
      message.error(error?.response?.data?.message || 'Không thể lấy danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (id: number) => {
    modal.confirm({
      title: 'Xác nhận phê duyệt',
      content: 'Việc phê duyệt sẽ chuyển toàn bộ quyền sở hữu NFT từ ví cũ sang ví mới của công dân. Thao tác này không thể hoàn tác. Bạn có chắc chắn?',
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          message.loading({ content: 'Đang phê duyệt và ghi nhận lên blockchain...', key: 'approve' });
          await api.post(`/wallet/recovery-requests/${id}/approve`);
          message.success({ content: 'Phê duyệt khôi phục ví thành công!', key: 'approve' });
          fetchRequests();
        } catch (error: any) {
          console.error(error);
          message.error({ content: error?.response?.data?.message || 'Lỗi khi phê duyệt', key: 'approve' });
        }
      }
    });
  };

  const handleReject = (id: number) => {
    modal.confirm({
      title: 'Từ chối yêu cầu',
      content: 'Bạn có chắc chắn muốn từ chối yêu cầu khôi phục ví này?',
      okText: 'Từ chối',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          message.loading({ content: 'Đang từ chối...', key: 'reject' });
          await api.post(`/wallet/recovery-requests/${id}/reject`, { reason: 'Từ chối bởi Lãnh đạo' });
          message.success({ content: 'Đã từ chối yêu cầu', key: 'reject' });
          fetchRequests();
        } catch (error: any) {
          console.error(error);
          message.error({ content: error?.response?.data?.message || 'Lỗi khi từ chối', key: 'reject' });
        }
      }
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Công dân',
      key: 'citizen',
      render: (_: any, record: RecoveryRequest) => (
        <div>
          <div className="font-semibold">{record.userFullName}</div>
          <div className="text-gray-500 text-xs">CCCD: {record.userVneidNumber}</div>
        </div>
      )
    },
    {
      title: 'Thông tin ví',
      key: 'wallet',
      render: (_: any, record: RecoveryRequest) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-500">Cũ: </span>
            <span className="font-mono bg-red-50 text-red-700 px-1 rounded truncate inline-block max-w-[150px]" title={record.oldWalletAddress}>
              {record.oldWalletAddress.substring(0, 10)}...
            </span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Mới: </span>
            <span className="font-mono bg-green-50 text-green-700 px-1 rounded truncate inline-block max-w-[150px]" title={record.newWalletAddress}>
              {record.newWalletAddress.substring(0, 10)}...
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'Pending') return <Tag color="warning">Chờ duyệt</Tag>;
        if (status === 'Approved') return <Tag color="success">Đã duyệt</Tag>;
        if (status === 'Rejected') return <Tag color="error">Từ chối</Tag>;
        return <Tag>{status}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: RecoveryRequest) => (
        <Space size="middle">
          {record.status === 'Pending' && (
            <>
              <Tooltip title="Phê duyệt">
                <Button 
                  type="text" 
                  icon={<CheckCircleOutlined className="text-green-600" />} 
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button 
                  type="text" 
                  danger
                  icon={<CloseCircleOutlined />} 
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khôi phục Ví</h1>
          <p className="text-gray-600 mt-1">Phê duyệt cấp lại ví và chuyển đổi NFT an toàn cho công dân.</p>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <Table 
          columns={columns} 
          dataSource={requests} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
