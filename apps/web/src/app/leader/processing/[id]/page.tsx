"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button, App, Typography } from 'antd';
import PropertySummary from '@/components/leader/processing/PropertySummary';
import BlockchainSync from '@/components/leader/processing/BlockchainSync';
import RiskMonitoring from '@/components/leader/processing/RiskMonitoring';
import SignatureStepper from '@/components/leader/processing/SignatureStepper';
import ApprovalActions from '@/components/leader/processing/ApprovalActions';
import { api } from '@/utils/api';

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

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/land-records/${id}`);
      const record = response.data;

      // Map API data to the approval detail structure
      const mappedData = {
        id: record.id,
        recordId: `HS-${record.id.toString().padStart(4, '0')}`,
        type: record.landType || "Hồ sơ cấp GCN QSDĐ",
        status: record.status,
        property: {
          mapSheet: record.plotNumber || "—",
          parcelNumber: record.parcelNumber || "—",
          area: `${record.area} m²`,
          landUse: record.landType || "Đất ở tại đô thị",
          address: record.address
        },
        blockchain: [
          { field: "Parcel ID", value: `PID-${record.plotNumber}-${record.parcelNumber}-VN` },
          { field: "Owner", value: `${record.owner?.fullName} (${record.owner?.vneidNumber})` },
          { field: "Area", value: `${record.area}_SQM` },
          { field: "Coordinates", value: record.gpsCoordinates || "CHƯA CÓ" },
          { field: "Status", value: record.status.toUpperCase() },
          { field: "Token ID", value: record.status === 'Minted' ? "ĐÃ CẤP" : "CHỜ SAU KHI KÝ", isTokenId: true }
        ],
        risks: [
          { title: "Kiểm tra quy hoạch", desc: "Không nằm trong vùng quy hoạch treo." },
          { title: "Tranh chấp pháp lý", desc: "Không ghi nhận đơn từ tranh chấp (30 ngày)." },
          { title: "Nghĩa vụ tài chính", desc: "Đã hoàn thành nghĩa vụ tài chính." }
        ],
        signatures: [
          { role: "Cán bộ Thụ lý", name: record.reviewedByFirst?.fullName || "Chưa có dữ liệu", status: record.reviewedByFirst ? "signed" as const : "pending" as const, time: record.createdAt },
          { role: "Cán bộ Thẩm định", name: record.assignedCb?.fullName || "Đang xử lý", status: record.status === 'CB_APPROVED' || record.status === 'Leader Signed' || record.status === 'Minted' ? "signed" as const : "pending" as const, time: record.updatedAt },
          { role: "Lãnh đạo Chi nhánh", name: record.status === 'Leader Signed' || record.status === 'Minted' ? "Đã ký số" : "ĐANG CHỜ PHÊ DUYỆT", status: record.status === 'CB_APPROVED' ? "pending" as const : "signed" as const, isCurrentUser: true }
        ],
        nft: record.status === 'Minted' ? {
          tokenId: record.tokenId || "—",
          mintTxHash: record.mintTxHash || "",
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://sepolia.etherscan.io/tx/${record.mintTxHash}`
        } : null
      };

      setData(mappedData);
    } catch (error) {
      console.error("Failed to fetch approval details", error);
      message.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c56d0]"></div>
    </div>
  );

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
              {data.type} mã <span className="font-mono font-bold text-gray-900">{data.recordId}</span>
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
          
          {data.nft && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 flex gap-6 items-center">
              <div className="bg-white p-2 rounded-lg border border-green-100 shadow-sm">
                <img src={data.nft.qrCode} alt="NFT QR Code" className="w-32 h-32" />
              </div>
              <div>
                <h4 className="text-green-800 font-bold text-lg mb-1">Hồ sơ đã được số hóa thành công!</h4>
                <p className="text-green-700 text-sm mb-3">Tài sản đã được đúc thành NFT trên mạng lưới Blockchain Sepolia.</p>
                <div className="flex gap-3">
                  <Button 
                    type="primary" 
                    ghost 
                    size="small" 
                    className="font-bold border-green-600 text-green-600"
                    onClick={() => {
                      if (data.nft?.mintTxHash) {
                        window.open(`https://sepolia.etherscan.io/tx/${data.nft.mintTxHash}`, '_blank');
                      } else {
                        message.warning("Mã giao dịch đúc (Transaction Hash) chưa được đồng bộ.");
                      }
                    }}
                  >
                    Xem trên Explorer
                  </Button>
                  <Button type="primary" size="small" className="bg-green-600 hover:bg-green-700 font-bold border-none">Tải GCN Kỹ thuật số</Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <RiskMonitoring data={data.risks} />
          <SignatureStepper data={data.signatures} />
          {(data.status === 'CB_APPROVED' || data.status === 'Leader Signed') && (
            <ApprovalActions recordId={data.id} onRefresh={fetchData} status={data.status} />
          )}
        </div>
      </div>
    </div>
  );
}
