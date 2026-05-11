"use client";

import React, { useState, useEffect } from 'react';
import ReportHeader from '@/components/staff/reports/ReportHeader';
import StatsCards from '@/components/staff/reports/StatsCards';
import RealTimeStats from '@/components/staff/reports/RealTimeStats';
import FinancialReport from '@/components/staff/reports/FinancialReport';
import DepartmentProgress from '@/components/staff/reports/DepartmentProgress';
import ReportList from '@/components/staff/reports/ReportList';

// MOCK DATA
const mockReportData = {
  stats: {
    nodes: "1,204,550",
    nodesGrowth: "+1.2%",
    nfts: "85,320",
    nftsGrowth: "+5.4%",
    records: "12,430",
    recordsGrowth: "+0.8%"
  },
  realTime: {
    completionRate: 94,
    approved: "8,420",
    processing: "3,210",
    backlog: "800"
  },
  financial: {
    totalRevenue: "342 tỷ VNĐ",
    completionRate: "102.5%",
    monthlyData: [
      { month: "Tháng 1", value: 30 },
      { month: "Tháng 2", value: 55 },
      { month: "Tháng 3", value: 100 },
      { month: "Tháng 4", value: 45 },
      { month: "Tháng 5", value: 70 },
      { month: "Tháng 6", value: 85 }
    ]
  },
  departmentProgress: [
    { name: "Phòng Quản lý Đất đai", progress: 85, status: "Bình thường", color: "#0052cc" },
    { name: "Văn phòng Đăng ký Đất đai", note: "(Nút thắt cổ chai)", progress: 42, status: "Quá tải", color: "#b91c1c" },
    { name: "Sở Tài chính - Thuế", progress: 98, status: "Hiệu quả cao", color: "#15803d" }
  ],
  reportList: [
    { id: 1, name: "Báo cáo biến động thị trường Q2", icon: "LineChartOutlined", type: "Định kỳ", typeColor: "gray", updated: "15/05/2024" },
    { id: 2, name: "Báo cáo quy hoạch hạ tầng số", icon: "FileTextOutlined", type: "Hệ thống", typeColor: "blue", updated: "10/05/2024" },
    { id: 3, name: "Báo cáo quyết toán tài chính 2023", icon: "DollarOutlined", type: "Tổng kết", typeColor: "gray", updated: "01/05/2024" }
  ]
};

export default function StaffReportsPage() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    // Simulate API fetch
    setData(mockReportData);
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12">
      <ReportHeader />
      <StatsCards data={data.stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <RealTimeStats data={data.realTime} />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <FinancialReport data={data.financial} />
        </div>
      </div>

      <DepartmentProgress data={data.departmentProgress} />
      <ReportList data={data.reportList} />
    </div>
  );
}
