import React from 'react';
import { SafetyCertificateOutlined, CheckCircleFilled } from '@ant-design/icons';

interface RiskMonitoringProps {
  data: {
    title: string;
    desc: string;
  }[];
}

export default function RiskMonitoring({ data }: RiskMonitoringProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3 mb-6 m-0">
        <SafetyCertificateOutlined className="text-[#0c56d0]" /> Giám sát rủi ro
      </h3>
      
      <div className="space-y-6">
        {data.map((risk, index) => (
          <div key={index} className="flex gap-4 items-start">
            <CheckCircleFilled className="text-green-500 text-xl mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-gray-900 text-sm mb-1">{risk.title}</div>
              <div className="text-gray-600 text-sm leading-relaxed">{risk.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
