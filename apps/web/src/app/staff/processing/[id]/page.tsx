"use client";

import React, { useState, useEffect } from 'react';
import ProcessingHeader from '@/components/staff/processing/ProcessingHeader';
import DocumentViewer from '@/components/staff/processing/DocumentViewer';
import VerificationPanel from '@/components/staff/processing/VerificationPanel';
import PropertyAttributes from '@/components/staff/processing/PropertyAttributes';
import GisMapBlock from '@/components/staff/processing/GisMapBlock';
import ProcessingActions from '@/components/staff/processing/ProcessingActions';

const mockProcessingData = {
  recordId: "HS-2024-0891",
  recordType: "CẤP MỚI GCN",
  title: "Kiểm tra & Làm sạch dữ liệu hồ sơ",
  progress: 85,
  documents: [
    { id: "doc1", name: "Sổ đỏ (Quét)", url: "/mock-doc1.jpg" },
    { id: "doc2", name: "Hợp đồng chuyển nhượng", url: "/mock-doc2.jpg" },
    { id: "doc3", name: "Sơ đồ thửa đất", url: "/mock-doc3.jpg" }
  ],
  ownerVerification: {
    status: "ĐÃ KẾT NỐI VNeID API",
    ocrData: {
      fullName: "NGUYỄN VĂN THÀNH",
      idNumber: "001085002931"
    },
    vneidData: {
      fullName: "NGUYỄN VĂN THÀNH",
      status: "Định danh mức 2",
      match: true
    }
  },
  propertyAttributes: {
    mapSheet: "42",
    parcelNumber: "118",
    area: "124.5 m²"
  },
  gisData: {
    system: "VN-2000",
    status: "Hệ tọa độ chính xác",
    center: "10.762622, 106.660172",
    polygon: "THỬA 118"
  }
};

export default function ProcessingDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    // Simulate API fetch using params.id
    // setTimeout is just to show a tiny delay like a real API
    const timer = setTimeout(() => {
      setData(mockProcessingData);
    }, 200);
    return () => clearTimeout(timer);
  }, [params.id]);

  if (!data) return <div className="p-8">Đang tải chi tiết hồ sơ...</div>;

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
        <ProcessingActions />
      </div>
    </div>
  );
}
