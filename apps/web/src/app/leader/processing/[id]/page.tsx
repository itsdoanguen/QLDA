"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import PropertySummary from '@/components/leader/processing/PropertySummary';
import BlockchainSync from '@/components/leader/processing/BlockchainSync';
import RiskMonitoring from '@/components/leader/processing/RiskMonitoring';
import SignatureStepper from '@/components/leader/processing/SignatureStepper';
import ApprovalActions from '@/components/leader/processing/ApprovalActions';

const mockApprovalData = {
  recordId: "HS-2023-8842",
  type: "Hồ sơ cấp GCN QSDĐ",
  property: {
    mapSheet: "14",
    parcelNumber: "205",
    area: "125.5 m²",
    landUse: "Sử dụng riêng",
    address: "Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
  },
  blockchain: [
    { field: "Parcel ID", value: "PID-14-205-HCMC-Q1" },
    { field: "Owner", value: "0x71C...9A23 (Đã xác minh KYC)" },
    { field: "Area", value: "125.5_SQM" },
    { field: "Land Use", value: "RESIDENTIAL_URBAN" },
    { field: "Term", value: "LONG_TERM" },
    { field: "Coordinates Hash", value: "a8f2c9e7...b310d4" },
    { field: "Token ID (Dự kiến)", value: "TBD_AFTER_MINT", isTokenId: true }
  ],
  risks: [
    { title: "Kiểm tra quy hoạch", desc: "Không nằm trong vùng quy hoạch treo." },
    { title: "Tranh chấp pháp lý", desc: "Không ghi nhận đơn từ tranh chấp (30 ngày)." },
    { title: "Nghĩa vụ tài chính", desc: "Đã hoàn thành thuế đất phi nông nghiệp." }
  ],
  signatures: [
    { role: "Cán bộ Đo đạc & Bản đồ", name: "Nguyễn Văn A", status: "signed" as const, time: "14/10/2023 09:15" },
    { role: "Cán bộ Thẩm định Pháp lý", name: "Trần Thị B", status: "signed" as const, time: "15/10/2023 14:30" },
    { role: "Lãnh đạo Chi nhánh", name: "Lê Văn C", status: "pending" as const, isCurrentUser: true }
  ]
};

export default function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setData(mockApprovalData);
  }, [params.id]);

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <div 
          className="text-[#0c56d0] text-sm font-medium flex items-center gap-2 cursor-pointer hover:underline mb-4 w-fit"
          onClick={() => router.push('/leader/dashboard')}
        >
          <ArrowLeftOutlined /> Quay lại danh sách
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 mb-2">Chi tiết Phê duyệt & Ký số</h1>
            <div className="text-gray-600 text-base">
              {data.type} mã <span className="font-mono font-bold text-gray-900">{params.id || data.recordId}</span>
            </div>
          </div>
          <Button icon={<PrinterOutlined />} className="font-medium text-gray-600 border-gray-300">
            In trích lục
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <PropertySummary data={data.property} />
          <BlockchainSync data={data.blockchain} />
        </div>
        
        {/* Right Column */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <RiskMonitoring data={data.risks} />
          <SignatureStepper data={data.signatures} />
          <ApprovalActions />
        </div>
      </div>
    </div>
  );
}
