import React, { useState } from 'react';
import { Button, App, Modal, Alert } from 'antd';
import { SafetyCertificateOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { api } from '@/utils/api';

interface ApprovalActionsProps {
  recordId: number;
  onRefresh: () => void;
  status: string;
}

export default function ApprovalActions({ recordId, onRefresh, status }: ApprovalActionsProps) {
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
          
          // 2. Mint NFT in the background
          message.info('Đang gửi yêu cầu đúc NFT lên Blockchain Sepolia...');
          
          api.post(`/nft/mint/${recordId}`)
            .then(() => {
              message.success('Đã đúc NFT thành công!');
              onRefresh();
            })
            .catch((err) => {
              console.log('Background minting status:', err);
              message.success('Yêu cầu đúc NFT đang được xử lý ngầm trên blockchain. Bạn có thể làm việc khác.');
              onRefresh();
            });

          // Instantly refresh the page to show Leader Signed state
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

  const handleMintOnly = async () => {
    modal.confirm({
      title: 'Xác nhận Đúc NFT Sổ đỏ',
      icon: <SafetyCertificateOutlined className="text-[#0c56d0]" />,
      content: 'Hồ sơ này đã được ký duyệt thành công nhưng chưa được đúc NFT. Bấm xác nhận để thực hiện lại việc đúc NFT trên Blockchain.',
      okText: 'Xác nhận Đúc',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          message.info('Đang gửi yêu cầu đúc NFT lên Blockchain Sepolia...');
          
          api.post(`/nft/mint/${recordId}`)
            .then(() => {
              message.success('Đã đúc NFT thành công!');
              onRefresh();
            })
            .catch((err) => {
              console.log('Background minting status:', err);
              message.success('Yêu cầu đúc NFT đang được xử lý ngầm trên blockchain. Bạn có thể làm việc khác.');
              onRefresh();
            });

          // Instantly refresh the page to show Leader Signed state
          onRefresh();
        } catch (error: any) {
          console.error('Minting failed', error);
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đúc NFT');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (status === 'Leader Signed') {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex gap-3 mb-2">
          <InfoCircleOutlined className="text-orange-500 text-base mt-0.5" />
          <p className="text-[12.5px] text-orange-700 leading-relaxed font-medium mb-0">
            Hồ sơ đã được ký duyệt thành công nhưng bước đúc NFT trước đó bị gián đoạn/timeout. Vui lòng bấm nút dưới đây để thử lại.
          </p>
        </div>
        <Button 
          type="primary" 
          size="large" 
          loading={loading}
          className="w-full bg-[#0c56d0] hover:bg-blue-700 font-bold h-12 flex items-center justify-center gap-2"
          onClick={handleMintOnly}
        >
          <SafetyCertificateOutlined /> Đúc NFT trên Blockchain
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert
        message="Lưu ý về tiến trình Blockchain"
        description="Giao dịch ký duyệt & đúc NFT Sổ đỏ sẽ tương tác trực tiếp với mạng lưới Blockchain Sepolia thực tế. Quá trình này có thể mất từ 15 đến 45 giây. Vui lòng giữ nguyên trình duyệt, KHÔNG tắt trang hoặc tải lại trang cho đến khi hệ thống báo thành công."
        type="warning"
        showIcon
        className="mb-2 rounded-lg text-[12.5px] leading-relaxed font-medium"
      />
      
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
