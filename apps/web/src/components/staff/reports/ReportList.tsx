import { Input } from 'antd';
import { SearchOutlined, LineChartOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import React from 'react';

// Map string icons to actual AntD components
const iconMap: Record<string, React.ReactNode> = {
  LineChartOutlined: <LineChartOutlined className="text-gray-400 text-base" />,
  FileTextOutlined: <FileTextOutlined className="text-gray-400 text-base" />,
  DollarOutlined: <DollarOutlined className="text-gray-400 text-base" />
};

interface ReportItem {
  id: number;
  name: string;
  icon: string;
  type: string;
  typeColor: string;
  updated: string;
}

interface ReportListProps {
  data: ReportItem[];
}

export default function ReportList({ data }: ReportListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h3 className="text-sm font-bold text-gray-900 m-0">Danh sách mẫu báo cáo chi tiết</h3>
        <Input 
          prefix={<SearchOutlined className="text-gray-400" />} 
          placeholder="Tìm kiếm mẫu báo cáo..." 
          className="w-64 bg-gray-100 border-transparent focus:bg-white transition-all"
        />
      </div>
      
      <table className="w-full text-xs text-left">
        <thead className="text-[10px] text-gray-500 uppercase bg-white border-b border-gray-200 tracking-wider">
          <tr>
            <th className="px-6 py-4 font-bold">TÊN BÁO CÁO</th>
            <th className="px-6 py-4 font-bold">LOẠI</th>
            <th className="px-6 py-4 font-bold">CẬP NHẬT LẦN CUỐI</th>
            <th className="px-6 py-4 font-bold text-right">THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {data.map((report) => (
            <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                {iconMap[report.icon]}
                {report.name}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  report.typeColor === 'blue' 
                    ? 'bg-blue-50 text-[#0052cc]' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {report.type}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 font-medium">{report.updated}</td>
              <td className="px-6 py-4 text-right">
                <span className="text-[#0052cc] font-bold mr-4 cursor-pointer hover:underline">Excel</span>
                <span className="text-[#0052cc] font-bold cursor-pointer hover:underline">PDF</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
        <span className="text-[#0052cc] font-bold text-xs cursor-pointer hover:underline">Xem tất cả 45 mẫu báo cáo</span>
      </div>
    </div>
  );
}
