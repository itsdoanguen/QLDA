import React from 'react';
import { DashboardOutlined } from '@ant-design/icons';

interface DepartmentSpeed {
  name: string;
  progress: number;
  color: string;
}

interface ProcessingSpeedProps {
  data: DepartmentSpeed[];
}

export default function ProcessingSpeed({ data }: ProcessingSpeedProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-base">
        <DashboardOutlined /> Tốc Độ Xử Lý
      </h3>
      
      <div className="space-y-5">
        {data.map((dept, index) => (
          <div key={index}>
            <div className="flex justify-between text-[11px] font-bold text-gray-700 mb-1">
              <span>{dept.name}</span>
              <span style={{ color: dept.color }}>{dept.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${dept.progress}%`, backgroundColor: dept.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
