import React, { useState } from 'react';
import { EyeOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import { useRouter } from 'next/navigation';

interface ApprovalItem {
  id: number;
  displayId: string;
  type: string;
  officer: string;
  status: string;
  tokenId?: string;
  isUrgent?: boolean;
}

interface ApprovalQueueProps {
  data: ApprovalItem[];
  approvedData?: ApprovalItem[];
}

export default function ApprovalQueue({ data, approvedData = [] }: ApprovalQueueProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const currentList = activeTab === 'pending' ? data : approvedData;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1">
      {/* Tabs Header */}
      <div className="flex justify-between items-center px-6 pt-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button 
            className={`font-bold text-[15px] pb-4 border-b-2 transition-all focus:outline-none ${
              activeTab === 'pending' 
                ? 'text-[#0c56d0] border-[#0c56d0]' 
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Hàng đợi phê duyệt ({data.length})
          </button>
          <button 
            className={`font-bold text-[15px] pb-4 border-b-2 transition-all focus:outline-none ${
              activeTab === 'approved' 
                ? 'text-[#0c56d0] border-[#0c56d0]' 
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('approved')}
          >
            Hồ sơ đã duyệt ({approvedData.length})
          </button>
        </div>
        <span 
          className="text-[#0c56d0] text-xs font-bold cursor-pointer hover:underline flex items-center gap-1 pb-4"
          onClick={() => router.push('/leader/records')}
        >
          Xem tất cả &rarr;
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-gray-500 uppercase bg-[#fcfdff] border-b border-gray-200 tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">MÃ HỒ SƠ</th>
              {activeTab === 'approved' && <th className="px-6 py-4 font-bold">TOKEN ID</th>}
              <th className="px-6 py-4 font-bold">LOẠI GIAO DỊCH</th>
              <th className="px-6 py-4 font-bold">CÁN BỘ THỤ LÝ</th>
              <th className="px-6 py-4 font-bold">TRẠNG THÁI</th>
              <th className="px-6 py-4 font-bold text-right">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'approved' ? 6 : 5} className="px-6 py-12 text-center text-gray-400 font-medium">
                  Chưa có dữ liệu hồ sơ nào trong hàng đợi
                </td>
              </tr>
            ) : (
              currentList.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 font-mono text-gray-500 text-xs">{item.displayId}</td>
                  
                  {activeTab === 'approved' && (
                    <td className="px-6 py-5">
                      {item.tokenId && item.tokenId !== 'N/A' ? (
                        <Tag color="blue" className="font-mono font-bold">#{item.tokenId}</Tag>
                      ) : (
                        <Tag color="default" className="font-mono font-semibold">Chờ Mint</Tag>
                      )}
                    </td>
                  )}

                  <td className="px-6 py-5 font-semibold text-gray-900">{item.type}</td>
                  <td className="px-6 py-5 text-gray-600">{item.officer}</td>
                  
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap uppercase ${
                      activeTab === 'pending'
                        ? (item.isUrgent ? 'bg-red-100 text-red-600' : 'bg-orange-50 text-orange-600 border border-orange-100')
                        : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                    <Button 
                      type={activeTab === 'pending' ? 'primary' : 'default'}
                      size="middle" 
                      onClick={() => router.push(`/leader/processing/${item.id}`)}
                      className={`!font-bold !text-xs !rounded-md !px-4 ${
                        activeTab === 'pending' 
                          ? '!bg-[#0c56d0] hover:!bg-blue-700 !border-none' 
                          : 'hover:!text-[#0c56d0] hover:!border-[#0c56d0]'
                      }`}
                    >
                      {activeTab === 'pending' ? 'KÝ DUYỆT' : 'XEM LẠI'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
