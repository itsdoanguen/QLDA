import React from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

interface ApprovalItem {
  id: number;
  displayId: string;
  type: string;
  officer: string;
  status: string;
  isUrgent?: boolean;
}

interface ApprovalQueueProps {
  data: ApprovalItem[];
}

export default function ApprovalQueue({ data }: ApprovalQueueProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 text-base m-0">Hàng Đợi Phê Duyệt Ưu Tiên</h3>
        <span 
          className="text-[#0c56d0] text-xs font-bold cursor-pointer hover:underline flex items-center gap-1"
          onClick={() => router.push('/leader/records')}
        >
          Xem tất cả &rarr;
        </span>
      </div>

      <table className="w-full text-sm text-left">
        <thead className="text-[10px] text-gray-500 uppercase bg-white border-b border-gray-200 tracking-wider">
          <tr>
            <th className="px-6 py-4 font-bold">MÃ HỒ SƠ</th>
            <th className="px-6 py-4 font-bold">LOẠI GIAO DỊCH</th>
            <th className="px-6 py-4 font-bold">CÁN BỘ THỤ LÝ</th>
            <th className="px-6 py-4 font-bold">TRẠNG THÁI</th>
            <th className="px-6 py-4 font-bold text-right">HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-5 font-mono text-gray-500 text-xs">{item.displayId}</td>
              <td className="px-6 py-5 font-medium text-gray-900">{item.type}</td>
              <td className="px-6 py-5 text-gray-700">{item.officer}</td>
              <td className="px-6 py-5">
                <span className={`px-2.5 py-1.5 rounded text-[10px] font-bold whitespace-nowrap uppercase ${
                  item.isUrgent 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-5 text-right flex items-center justify-end gap-4">
                <EyeOutlined 
                  className="text-[#0c56d0] text-lg cursor-pointer hover:opacity-70" 
                  onClick={() => router.push(`/leader/processing/${item.id}`)}
                />
                <Button 
                  type="primary" 
                  size="middle" 
                  className="bg-[#0c56d0] hover:bg-blue-700 font-bold px-5 text-xs rounded"
                  onClick={() => router.push(`/leader/processing/${item.id}`)}
                >
                  KÝ DUYỆT
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
