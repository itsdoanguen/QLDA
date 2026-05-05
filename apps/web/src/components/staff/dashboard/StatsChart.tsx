import React from 'react';

export default function StatsChart() {
  return (
    <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded flex flex-col">
      <h3 className="font-h3 text-h3 text-on-surface mb-lg">Trạng thái hồ sơ</h3>
      <div className="flex-1 flex items-center justify-center relative py-md">
        {/* Circular Progress Visualization Placeholder */}
        <div className="w-40 h-40 rounded-full border-[12px] border-surface-container-highest relative flex items-center justify-center">
          <div className="absolute inset-0 border-[12px] border-primary border-t-transparent border-l-transparent rounded-full rotate-45"></div>
          <div className="text-center">
            <span className="text-h1 font-black text-on-surface">64%</span>
            <p className="text-label-sm text-secondary">Hoàn thành</p>
          </div>
        </div>
      </div>
      
      <div className="mt-md space-y-sm">
        <div className="flex items-center justify-between text-body-md">
          <div className="flex items-center gap-sm">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span>Đã duyệt</span>
          </div>
          <span className="font-mono-data font-bold">142</span>
        </div>
        <div className="flex items-center justify-between text-body-md">
          <div className="flex items-center gap-sm">
            <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
            <span>Chờ bổ sung</span>
          </div>
          <span className="font-mono-data font-bold">48</span>
        </div>
        <div className="flex items-center justify-between text-body-md">
          <div className="flex items-center gap-sm">
            <span className="w-3 h-3 rounded-full bg-error"></span>
            <span>Bị từ chối</span>
          </div>
          <span className="font-mono-data font-bold">12</span>
        </div>
      </div>
    </div>
  );
}
