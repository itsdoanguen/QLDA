import React from 'react';
import { Button } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function ApprovalActions() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Button 
        type="primary" 
        size="large" 
        className="w-full bg-[#0c56d0] hover:bg-blue-700 font-bold h-12 flex items-center justify-center gap-2"
        onClick={() => router.push('/leader/dashboard')}
      >
        <SafetyCertificateOutlined /> Ký duyệt & Mint NFT
      </Button>
      
      <Button 
        size="large" 
        className="w-full font-bold h-12 border-gray-300 text-gray-700 hover:text-[#0c56d0] hover:border-[#0c56d0]"
      >
        Yêu cầu thẩm tra lại
      </Button>
      
      <Button 
        danger 
        size="large" 
        className="w-full font-bold h-12 border-red-300 text-red-600 hover:bg-red-50"
      >
        Từ chối hồ sơ
      </Button>
    </div>
  );
}
