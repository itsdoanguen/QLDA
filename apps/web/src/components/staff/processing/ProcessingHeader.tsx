import { FileTextOutlined } from '@ant-design/icons';
import { Progress } from 'antd';

export default function ProcessingHeader({ data }: { data: any }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#0052cc] text-2xl">
          <FileTextOutlined />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[#0052cc] font-bold text-sm m-0 uppercase tracking-wider">HỒ SƠ: {data.recordId}</h2>
            <span className="bg-blue-100 text-[#0052cc] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {data.recordType}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 m-0">{data.title}</h1>
        </div>
      </div>
      
      <div className="w-64 text-right">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-gray-500">Tiến độ làm sạch:</span>
          <span className="text-gray-900">{data.progress}%</span>
        </div>
        <Progress percent={data.progress} showInfo={false} size="small" strokeColor="#0052cc" className="m-0" />
      </div>
    </div>
  );
}
