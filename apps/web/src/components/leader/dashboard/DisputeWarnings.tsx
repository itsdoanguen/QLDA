import React from 'react';
import { WarningOutlined } from '@ant-design/icons';

interface WarningItem {
  id: string;
  message: string;
}

interface DisputeWarningsProps {
  data: WarningItem[];
}

export default function DisputeWarnings({ data }: DisputeWarningsProps) {
  return (
    <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm relative overflow-hidden">
      {/* Background red tint line at top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-red-400"></div>

      <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2 text-[11px] uppercase tracking-wider">
        <WarningOutlined /> CẢNH BÁO TRANH CHẤP
      </h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="bg-red-50/50 border border-red-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] font-bold text-gray-400 tracking-wider">{item.id}</span>
              <span className="text-[10px] font-bold text-red-500 uppercase cursor-pointer hover:underline">CHI TIẾT</span>
            </div>
            <p className="text-sm text-gray-700 m-0">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
