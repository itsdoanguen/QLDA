import { Button, App, Modal, Input } from 'antd';
import { CloseCircleOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';
import { api } from '@/utils/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProcessingActionsProps {
  recordId: number;
  status: string;
  onRefresh: () => void;
}

export default function ProcessingActions({ recordId, status, onRefresh }: ProcessingActionsProps) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'review' | 'reject' | 'request-supplement', reason?: string) => {
    try {
      setLoading(true);
      await api.post(`/land-records/${recordId}/${action}`, { reason });
      message.success(
        action === 'review' ? 'Đã duyệt hồ sơ' : 
        action === 'reject' ? 'Đã từ chối hồ sơ' : 
        'Đã yêu cầu bổ sung'
      );
      
      router.push('/staff/dashboard');
    } catch (error: any) {
      console.error(`Action ${action} failed`, error);
      message.error(error?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const showReasonModal = (action: 'reject' | 'request-supplement') => {
    let reasonText = '';
    modal.confirm({
      title: action === 'reject' ? 'Từ chối hồ sơ' : 'Yêu cầu bổ sung hồ sơ',
      content: (
        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-500">
            Vui lòng nhập lý do {action === 'reject' ? 'từ chối' : 'yêu cầu bổ sung'}:
          </p>
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập nội dung..." 
            onChange={(e) => { reasonText = e.target.value; }}
          />
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        if (!reasonText.trim()) {
          message.warning('Vui lòng nhập lý do');
          return Promise.reject();
        }
        return handleAction(action, reasonText);
      }
    });
  };

  const isFinalStep = status === 'PENDING_SECOND_REVIEW';
  const canReview = status === 'SUBMITTED' || status === 'PENDING_SECOND_REVIEW';

  return (
    <div className="flex justify-end items-center w-full">
      <div className="flex gap-4">
        <Button 
          icon={<ExclamationCircleOutlined />} 
          size="large" 
          className="text-orange-500 border-orange-200 hover:border-orange-500 font-bold bg-orange-50 hover:bg-orange-100"
          onClick={() => showReasonModal('request-supplement')}
          loading={loading}
          disabled={loading}
        >
          Yêu cầu bổ sung
        </Button>
        <Button 
          icon={<CloseCircleOutlined />} 
          size="large" 
          danger 
          className="font-bold"
          onClick={() => showReasonModal('reject')}
          loading={loading}
          disabled={loading}
        >
          Từ chối
        </Button>
        <Button 
          icon={<EditOutlined />} 
          size="large" 
          type="primary" 
          className="bg-[#0052cc] hover:bg-blue-700 font-bold px-8 shadow-md"
          onClick={() => handleAction('review')}
          loading={loading}
        >
          {isFinalStep ? 'Xác nhận & Hoàn tất (2/2)' : 'Xác nhận & Chuyển bước (1/2)'}
        </Button>
      </div>
    </div>
  );
}
