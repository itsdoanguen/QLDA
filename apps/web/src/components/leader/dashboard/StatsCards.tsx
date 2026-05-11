import React from 'react';
import { 
  FileDoneOutlined, 
  CheckSquareOutlined, 
  RollbackOutlined, 
  WarningOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

interface StatsCardsProps {
  data: {
    pendingApproval: { count: number; change: string };
    signedToday: { count: number; kpi: string };
    returned: { count: number; percent: string };
    overdueWarnings: { count: number; status: string };
  };
}

export default function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* CẦN DUYỆT */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">CẦN DUYỆT</div>
          <FileDoneOutlined className="text-xl text-gray-600" />
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-4">{data.pendingApproval.count}</div>
        <div className="flex items-center gap-1 text-xs font-bold text-red-500">
          <ArrowUpOutlined /> {data.pendingApproval.change}
        </div>
      </div>

      {/* ĐÃ KÝ (HÔM NAY) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ĐÃ KÝ (HÔM NAY)</div>
          <CheckSquareOutlined className="text-xl text-gray-600" />
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-4">{data.signedToday.count}</div>
        <div className="flex items-center gap-1 text-xs font-bold text-[#0c56d0]">
          <CheckCircleOutlined /> {data.signedToday.kpi}
        </div>
      </div>

      {/* TRẢ VỀ BỔ SUNG */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">TRẢ VỀ BỔ SUNG</div>
          <RollbackOutlined className="text-xl text-gray-600" />
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-4">{data.returned.count}</div>
        <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <InfoCircleOutlined /> {data.returned.percent}
        </div>
      </div>

      {/* CẢNH BÁO QUÁ HẠN */}
      <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">CẢNH BÁO QUÁ HẠN</div>
          <WarningOutlined className="text-xl text-red-500" />
        </div>
        <div className="text-4xl font-bold text-red-600 mb-4">{data.overdueWarnings.count}</div>
        <div className="flex items-center gap-1 text-xs font-bold text-red-500 border-t border-red-100 pt-3 mt-1">
          <WarningOutlined /> {data.overdueWarnings.status}
        </div>
      </div>
    </div>
  );
}
