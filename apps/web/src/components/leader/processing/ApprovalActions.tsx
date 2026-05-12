import React, { useState } from 'react';
import { Button, App, Modal } from 'antd';
import { SafetyCertificateOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { api } from '@/utils/api';

interface ApprovalActionsProps {
  recordId: number;
  onRefresh: () => void;
}

export default function ApprovalActions({ recordId, onRefresh }: ApprovalActionsProps) {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    modal.confirm({
      title: 'Xác nhận Ký duyệt & Đúc NFT',
      icon: <SafetyCertificateOutlined className="text-[#0c56d0]" />,
      content: 'Bằng việc ký duyệt, hồ sơ này sẽ được số hóa thành NFT trên mạng lưới Blockchain. Thao tác này không thể hoàn tác.',
      okText: 'Xác nhận Ký',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          // 1. Sign
          await api.post(`/approvals/${recordId}/sign`, { reason: 'Phê duyệt hồ sơ đầy đủ điều kiện.' });
          message.success('Đã ký duyệt hồ sơ thành công!');
          
          // 2. Mint NFT
          message.loading('Đang tiến hành đúc NFT trên Blockchain...');
          await api.post(`/nft/mint/${recordId}`);
          
          message.success('Đã đúc NFT thành công!');
          onRefresh();
        } catch (error: any) {
          console.error('Approval failed', error);
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReject = async () => {
    modal.confirm({
      title: 'Xác nhận Từ chối hồ sơ',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: 'Bạn có chắc chắn muốn từ chối hồ sơ này? Hồ sơ sẽ được gửi trả lại để bổ sung thông tin.',
      okText: 'Xác nhận Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          await api.post(`/approvals/${recordId}/reject`, { reason: 'Hồ sơ chưa đạt yêu cầu thẩm định.' });
          message.success('Đã gửi trả hồ sơ thành công');
          onRefresh();
        } catch (error: any) {
          message.error('Có lỗi xảy ra khi từ chối hồ sơ');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Button 
        type="primary" 
        size="large" 
        loading={loading}
        className="w-full bg-[#0c56d0] hover:bg-blue-700 font-bold h-12 flex items-center justify-center gap-2"
        onClick={handleSign}
      >
        <SafetyCertificateOutlined /> Ký duyệt & Mint NFT
      </Button>
      
      <Button 
        size="large" 
        disabled={loading}
        className="w-full font-bold h-12 border-gray-300 text-gray-700 hover:text-[#0c56d0] hover:border-[#0c56d0]"
      >
        Yêu cầu thẩm tra lại
      </Button>
      
      <Button 
        danger 
        size="large" 
        loading={loading}
        className="w-full font-bold h-12 border-red-300 text-red-600 hover:bg-red-50"
        onClick={handleReject}
      >
        <CloseCircleOutlined /> Từ chối hồ sơ
      </Button>
    </div>
  );
}
