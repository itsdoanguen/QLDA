import React from 'react';
import { FormOutlined, CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';

interface Signature {
  role: string;
  name: string;
  status: 'signed' | 'pending';
  time?: string;
  isCurrentUser?: boolean;
}

interface SignatureStepperProps {
  data: Signature[];
}

export default function SignatureStepper({ data }: SignatureStepperProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3 mb-8 m-0">
        <FormOutlined className="text-[#0c56d0]" /> Các bước ký duyệt
      </h3>
      
      <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
        {data.map((sig, index) => (
          <div key={index} className="relative pl-6">
            <div className={`absolute w-3 h-3 rounded-full -left-[23px] top-1.5 ${
              sig.status === 'signed' ? 'bg-green-500' : 'bg-[#0c56d0]'
            } ring-4 ring-white`}></div>
            
            <div className="flex flex-col">
              <div className={`text-sm font-bold mb-1 ${sig.isCurrentUser ? 'text-[#0c56d0]' : 'text-gray-900'}`}>
                {sig.role} {sig.isCurrentUser && '(Bạn)'}
              </div>
              <div className="text-sm text-gray-700 mb-2">{sig.name}</div>
              
              <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                {sig.status === 'signed' ? (
                  <>
                    <CheckCircleFilled className="text-gray-400" />
                    <span>Đã ký: {sig.time}</span>
                  </>
                ) : (
                  <>
                    <ClockCircleOutlined className="text-gray-400" />
                    <span>Chờ ký duyệt</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
