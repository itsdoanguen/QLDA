"use client";

import React, { useState, useEffect } from 'react';
import StatsCards from '@/components/leader/dashboard/StatsCards';
import ApprovalQueue from '@/components/leader/dashboard/ApprovalQueue';
import ProcessingSpeed from '@/components/leader/dashboard/ProcessingSpeed';
import DisputeWarnings from '@/components/leader/dashboard/DisputeWarnings';
import { api } from '@/utils/api';

const mockDashboardData = {
  stats: {
    pendingApproval: { count: 142, change: "+12 từ hôm qua" },
    signedToday: { count: 86, kpi: "Hoàn thành 65% KPI" },
    returned: { count: 18, percent: "Chiếm 11% tổng HS" },
    overdueWarnings: { count: 5, status: "Cần xử lý ngay" }
  },
  queue: [
    { id: "HS-2023-8942", type: "Chuyển nhượng QSDĐ", officer: "Nguyễn Văn A", status: "CHỜ DUYỆT" },
    { id: "HS-2023-8945", type: "Cấp mới GCN", officer: "Trần Thị B", status: "KHẨN CẤP", isUrgent: true },
    { id: "HS-2023-8950", type: "Thế chấp QSDĐ", officer: "Lê Văn C", status: "CHỜ DUYỆT" },
    { id: "HS-2023-8951", type: "Góp vốn bằng QSDĐ", officer: "Phạm Thị D", status: "CHỜ DUYỆT" },
  ],
  speeds: [
    { name: "Phòng Hành chính 1", progress: 92, color: "#0c56d0" },
    { name: "Phòng Kỹ thuật Địa chính", progress: 78, color: "#0c56d0" },
    { name: "Phòng Pháp chế", progress: 45, color: "#dc2626" }
  ],
  warnings: [
    { id: "HS-2023-8102", message: "Trùng lặp ranh giới thửa 42." }
  ]
};

export default function LeaderDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, statsRes, approvedRes] = await Promise.all([
        api.get('/approvals/pending'),
        api.get('/approvals/stats'),
        api.get('/approvals/approved')
      ]);
      
      const pendingData = pendingRes.data;
      const statsData = statsRes.data;
      const approvedData = approvedRes.data;
      
      setData({
        stats: statsData,
        queue: pendingData.map((item: any) => ({
          id: item.id,
          displayId: `HS-${item.id.toString().padStart(4, '0')}`,
          type: item.landType || "Cấp mới GCN",
          officer: item.assignedCb?.fullName || "Chưa gán",
          status: "CHỜ DUYỆT",
          isUrgent: false
        })),
        approvedQueue: approvedData.map((item: any) => ({
          id: item.id,
          displayId: `HS-${item.id.toString().padStart(4, '0')}`,
          type: item.landType || "Cấp mới GCN",
          officer: item.assignedCb?.fullName || "Chưa gán",
          status: item.status === 'Minted' ? "ĐÃ MINT NFT" : "ĐÃ KÝ DUYỆT",
          tokenId: item.tokenId || "N/A",
          isUrgent: false
        })),
        speeds: [
          { name: "Phòng Hành chính 1", progress: 92, color: "#0c56d0" },
          { name: "Phòng Kỹ thuật Địa chính", progress: 78, color: "#0c56d0" },
          { name: "Phòng Pháp chế", progress: 45, color: "#dc2626" }
        ],
        warnings: []
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c56d0]"></div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      <StatsCards data={data.stats} />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-2/3">
          <ApprovalQueue data={data.queue} approvedData={data.approvedQueue} />
        </div>
        
        {/* Right Column */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <ProcessingSpeed data={data.speeds} />
          <DisputeWarnings data={data.warnings} />
        </div>
      </div>
    </div>
  );
}
