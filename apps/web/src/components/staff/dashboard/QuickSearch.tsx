import React from 'react';

export default function QuickSearch() {
  return (
    <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant p-lg rounded flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">travel_explore</span>
          Tra cứu nhanh số tờ / số thửa
        </h3>
        <span className="text-label-sm text-secondary bg-surface-container-low px-sm py-xs rounded">Dữ liệu thời gian thực</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-secondary">Quận / Huyện</label>
          <select className="border border-outline-variant rounded px-sm py-sm text-body-md focus:ring-primary focus:border-primary">
            <option>Quận 1</option>
            <option>Quận 3</option>
            <option>TP. Thủ Đức</option>
          </select>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-secondary">Phường / Xã</label>
          <select className="border border-outline-variant rounded px-sm py-sm text-body-md focus:ring-primary focus:border-primary">
            <option>Phường Bến Nghé</option>
            <option>Phường Đa Kao</option>
          </select>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-secondary">Số tờ - Số thửa</label>
          <input className="border border-outline-variant rounded px-sm py-sm text-body-md focus:ring-primary focus:border-primary" placeholder="Ví dụ: 12-45" type="text" />
        </div>
        <button className="bg-primary text-white py-sm rounded font-medium hover:bg-primary-container transition-colors h-[42px]">Tìm kiếm</button>
      </div>
    </div>
  );
}
