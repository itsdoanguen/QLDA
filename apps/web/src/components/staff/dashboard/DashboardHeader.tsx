import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined, PlusCircleOutlined } from '@ant-design/icons';

export default function DashboardHeader({ stats }: { stats: any }) {
  const pendingCount = stats?.submitted || 0;

  return (
    <div className="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">Bảng điều khiển Cán bộ</h1>
        <p className="text-[15px] text-[#4b5563]">
          Chào mừng trở lại. Bạn có <span className="font-bold text-[#0052cc]">{pendingCount} hồ sơ</span> cần xử lý hôm nay.
        </p>
      </div>
      <div className="flex gap-3">
        <Button 
          icon={<DownloadOutlined />}
          className="!h-10 !px-4 !rounded-md !border-[#e1e2e4] !text-[#374151] hover:!text-[#0052cc] hover:!border-[#0052cc] !font-medium flex items-center"
        >
          Tải báo cáo
        </Button>
        <Button 
          type="primary"
          icon={<PlusCircleOutlined />}
          className="!h-10 !px-4 !rounded-md !bg-[#0052cc] !border-none !font-medium flex items-center shadow-sm"
        >
          Tiếp nhận mới
        </Button>
      </div>
    </div>
  );
}
