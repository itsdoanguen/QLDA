import React from 'react';

export default function SystemAlerts() {
  return (
    <div className="col-span-12 lg:col-span-8 space-y-md">
      <div className="bg-white border border-outline-variant p-md rounded flex items-center gap-md">
        <div className="w-12 h-12 bg-error-container rounded-full flex items-center justify-center text-error">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>
        <div className="flex-1">
          <p className="text-body-md font-bold text-on-surface">Phát hiện dữ liệu trùng lặp</p>
          <p className="text-label-sm text-secondary">Hồ sơ HS-2024-0901 có tọa độ trùng với HS-2023-4412 đã được cấp sổ.</p>
        </div>
        <button className="px-md py-sm border border-outline-variant rounded font-medium text-label-sm hover:bg-surface-container-low transition-colors">
          Xử lý ngay
        </button>
      </div>
      
      <div className="bg-white border border-outline-variant p-md rounded flex items-center gap-md">
        <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="flex-1">
          <p className="text-body-md font-bold text-on-surface">Đồng bộ Blockchain thành công</p>
          <p className="text-label-sm text-secondary">15 hồ sơ ngày 21/05 đã được xác thực vào sổ cái điện tử.</p>
        </div>
        <button className="px-md py-sm border border-outline-variant rounded font-medium text-label-sm hover:bg-surface-container-low transition-colors">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
