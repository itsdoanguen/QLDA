import React from 'react';

export default function DashboardHeader() {
  return (
    <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
      <div>
        <h1 className="font-h1 text-h1 text-on-surface mb-xs">Bảng điều khiển Cán bộ</h1>
        <p className="text-body-lg text-secondary">
          Chào mừng trở lại. Bạn có <span className="font-bold text-primary">12 hồ sơ</span> cần xử lý hôm nay.
        </p>
      </div>
      <div className="flex gap-sm">
        <button className="px-md py-sm bg-white border border-outline-variant text-on-surface font-medium rounded hover:bg-surface-container-low flex items-center gap-xs transition-colors">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Tải báo cáo
        </button>
        <button className="px-md py-sm bg-primary text-white font-medium rounded hover:bg-primary-container flex items-center gap-xs transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Tiếp nhận mới
        </button>
      </div>
    </div>
  );
}
