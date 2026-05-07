import { SafetyCertificateOutlined } from '@ant-design/icons';

interface PropertyInfoProps {
  data: {
    status: string;
    statusDescription: string;
    area: string;
    landType: string;
  };
}

export default function PropertyInfo({ data }: PropertyInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm relative">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TRẠNG THÁI PHÁP LÝ</div>
        <div className="text-2xl font-bold text-green-700 mb-1">{data.status}</div>
        <div className="text-sm text-green-600">{data.statusDescription}</div>
        <div className="absolute top-4 right-4 text-green-500 text-xl">
          <SafetyCertificateOutlined />
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">DIỆN TÍCH & LOẠI ĐẤT</div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{data.area}</div>
        <div className="text-sm text-gray-600">{data.landType}</div>
      </div>
    </div>
  );
}
