import React from 'react';
import dynamic from 'next/dynamic';
import { Tag } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Đang tải bản đồ...</div>
});

export default function MapContext({ record }: { record: any }) {
  return (
    <div className="h-full flex flex-col bg-white border border-[#e1e2e4] rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#f3f4f6] bg-[#fcfdfe]">
        <h3 className="text-[14px] font-bold text-[#111827] flex items-center gap-2">
          <EnvironmentOutlined className="text-[#0052cc]" />
          Bối cảnh không gian
        </h3>
        {record && (
          <div className="mt-2">
            <div className="text-[12px] text-[#374151] font-medium truncate">{record.address}</div>
            <div className="flex gap-2 mt-1">
              <Tag className="!text-[10px] !m-0">Tờ: {record.plotNumber || '—'}</Tag>
              <Tag className="!text-[10px] !m-0">Thửa: {record.parcelNumber || '—'}</Tag>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-h-[400px] relative">
        <MapComponent record={record} />
      </div>
      
      <div className="p-4 bg-[#f9fafb] border-t border-[#f3f4f6]">
        <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
          <span>Pháp lý: {record?.isFrozen ? "Đã khóa" : "Đang xử lý"}</span>
          <span className="font-bold text-[#0052cc]">Dữ liệu VN-2000</span>
        </div>
      </div>
    </div>
  );
}
