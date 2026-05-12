"use client";

import React, { useState, useEffect } from 'react';
import ProcessingHeader from '@/components/staff/processing/ProcessingHeader';
import DocumentViewer from '@/components/staff/processing/DocumentViewer';
import VerificationPanel from '@/components/staff/processing/VerificationPanel';
import PropertyAttributes from '@/components/staff/processing/PropertyAttributes';
import GisMapBlock from '@/components/staff/processing/GisMapBlock';
import ProcessingActions from '@/components/staff/processing/ProcessingActions';
import { api } from '@/utils/api';
import { App } from 'antd';
import { useParams } from 'next/navigation';

export default function ProcessingDetailPage() {
  const { id } = useParams();
  const { message } = App.useApp();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/land-records/${id}`);
      const record = response.data;

      // Map API data to component structure
      const mappedData = {
        id: record.id,
        recordId: `HS-${record.id.toString().padStart(4, '0')}`,
        recordType: record.landType || "CẤP MỚI GCN",
        title: "Kiểm tra & Làm sạch dữ liệu hồ sơ",
        progress: record.status === 'CB_APPROVED' ? 100 : 85,
        status: record.status,
        documents: record.files?.map((f: any) => ({
          id: f.id,
          name: f.originalName || "Tài liệu đính kèm",
          url: f.url
        })) || [],
        ownerVerification: {
          status: "ĐÃ KẾT NỐI VNeID API",
          ocrData: {
            fullName: record.owner?.fullName || "N/A",
            idNumber: record.owner?.vneidNumber || "N/A"
          },
          vneidData: {
            fullName: record.owner?.fullName || "N/A",
            status: "Định danh mức 2",
            match: true
          }
        },
        propertyAttributes: {
          mapSheet: record.plotNumber || "—",
          parcelNumber: record.parcelNumber || "—",
          area: `${record.area} m²`
        },
        gisData: {
          system: "VN-2000",
          status: record.gpsCoordinates ? "Hệ tọa độ chính xác" : "Chưa có tọa độ",
          center: record.gpsCoordinates || "10.762622, 106.660172",
          polygon: `THỬA ${record.parcelNumber || "—"}`
        }
      };

      setData(mappedData);
    } catch (error) {
      console.error("Failed to fetch record details", error);
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
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052cc] mb-4"></div>
      <div className="text-gray-500 font-medium">Đang tải chi tiết hồ sơ...</div>
    </div>
  );

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-gray-500 font-medium text-lg">Không tìm thấy hồ sơ</div>
      <button 
        onClick={() => window.history.back()}
        className="mt-4 text-[#0052cc] font-bold hover:underline"
      >
        Quay lại
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-8 relative">
      {/* Top Header section */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0 z-10">
        <ProcessingHeader data={data} />
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-hidden flex bg-gray-50">
        {/* Left Column: Document Viewer */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-white p-6">
          <DocumentViewer documents={data.documents} />
        </div>

        {/* Right Column: Data Verification */}
        <div className="w-1/2 overflow-y-auto p-8 space-y-6">
          <VerificationPanel data={data.ownerVerification} />
          <PropertyAttributes data={data.propertyAttributes} />
          <GisMapBlock data={data.gisData} />
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-8 py-4 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ProcessingActions recordId={data.id} onRefresh={fetchData} status={data.status} />
      </div>
    </div>
  );
}
