import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export default function ReportHeader() {
  return (
    <div className="flex justify-between items-end mb-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] m-0 mb-1">Báo cáo & Phân tích</h1>
        <p className="text-gray-500 m-0 text-sm">Theo dõi hiệu suất vận hành và số liệu tài chính thời gian thực.</p>
      </div>
      <Button icon={<DownloadOutlined />} className="bg-gray-100 text-gray-700 border-0 font-medium px-4 h-9">
        Xuất tất cả báo cáo
      </Button>
    </div>
  );
}
