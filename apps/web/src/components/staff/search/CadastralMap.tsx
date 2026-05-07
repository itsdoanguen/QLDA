import { Button } from 'antd';
import { AimOutlined, EnvironmentOutlined } from '@ant-design/icons';

interface CadastralMapProps {
  data: {
    center: string;
    plotNumber: string;
    parcelNumber: string;
  };
}

export default function CadastralMap({ data }: CadastralMapProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col min-h-[400px]">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="font-bold text-gray-900 text-sm uppercase tracking-wider">Bản đồ địa chính</div>
        <div className="flex gap-2">
          <Button size="small" icon={<EnvironmentOutlined />} />
          <Button size="small" icon={<AimOutlined />} />
        </div>
      </div>
      <div className="flex-1 bg-[#e5e7eb] relative min-h-[300px]">
        {/* Placeholder for map */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">Map View</div>
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Tọa độ trung tâm:</span>
          <span className="font-mono text-gray-800">{data.center}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-3 rounded text-left">
            <div className="text-[10px] text-gray-500 uppercase mb-1 font-bold">Số tờ</div>
            <div className="text-xl font-bold text-gray-900">{data.plotNumber}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-3 rounded text-left">
            <div className="text-[10px] text-gray-500 uppercase mb-1 font-bold">Số thửa</div>
            <div className="text-xl font-bold text-gray-900">{data.parcelNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
