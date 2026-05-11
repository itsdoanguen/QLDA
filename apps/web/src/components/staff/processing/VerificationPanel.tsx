import { CheckCircleFilled, IdcardOutlined } from '@ant-design/icons';

export default function VerificationPanel({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 m-0 flex items-center gap-2 text-base">
          <span className="text-[#0052cc]"><IdcardOutlined /></span> 
          1. Định danh chủ sở hữu
        </h3>
        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
          <CheckCircleFilled /> {data.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">DỮ LIỆU OCR (TỪ HỒ SƠ)</div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 font-mono text-xs text-gray-800">
            <div className="flex">
              <span className="w-16 text-gray-400">Họ tên:</span> 
              <span className="font-bold">{data.ocrData.fullName}</span>
            </div>
            <div className="flex">
              <span className="w-16 text-gray-400">CCCD:</span> 
              <span className="font-bold">{data.ocrData.idNumber}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">DỮ LIỆU VNEID API</div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3 font-mono text-xs relative text-green-900">
            <div className="flex">
              <span className="w-20 text-green-600">Họ tên:</span> 
              <span className="font-bold">{data.vneidData.fullName}</span>
              {data.vneidData.match && <CheckCircleFilled className="text-green-500 ml-2" />}
            </div>
            <div className="flex">
              <span className="w-20 text-green-600">Trạng thái:</span> 
              <span>{data.vneidData.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
