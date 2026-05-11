import React from 'react';
import { BookOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface PropertySummaryProps {
  data: {
    mapSheet: string;
    parcelNumber: string;
    area: string;
    landUse: string;
    address: string;
  };
}

export default function PropertySummary({ data }: PropertySummaryProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3 m-0">
          <BookOutlined className="text-[#0c56d0]" /> Thông tin tóm tắt thửa đất
        </h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded">Đã xác minh</span>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">TỜ BẢN ĐỒ SỐ</div>
          <div className="text-base text-gray-900">{data.mapSheet}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">THỬA ĐẤT SỐ</div>
          <div className="text-base text-gray-900">{data.parcelNumber}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">DIỆN TÍCH</div>
          <div className="text-base text-gray-900">{data.area}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">HÌNH THỨC SỬ DỤNG</div>
          <div className="text-base text-gray-900">{data.landUse}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">ĐỊA CHỈ THỬA ĐẤT</div>
          <div className="text-base text-gray-900">{data.address}</div>
        </div>
      </div>
    </div>
  );
}
