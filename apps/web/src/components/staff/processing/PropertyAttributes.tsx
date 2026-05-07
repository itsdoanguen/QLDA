import { ProfileOutlined } from '@ant-design/icons';

export default function PropertyAttributes({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 m-0 flex items-center gap-2 text-base">
          <span className="text-[#0052cc]"><ProfileOutlined /></span> 
          2. Thông tin thuộc tính đất
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-100 p-5 rounded-lg text-center flex flex-col justify-center">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">SỐ TỜ BẢN ĐỒ</div>
          <div className="text-2xl font-bold text-gray-900 leading-none">{data.mapSheet}</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 p-5 rounded-lg text-center flex flex-col justify-center">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">SỐ THỬA ĐẤT</div>
          <div className="text-2xl font-bold text-gray-900 leading-none">{data.parcelNumber}</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg text-center flex flex-col justify-center">
          <div className="text-[10px] font-bold text-[#0052cc] uppercase tracking-wider mb-2">DIỆN TÍCH</div>
          <div className="text-2xl font-bold text-[#0052cc] leading-none">{data.area}</div>
        </div>
      </div>
    </div>
  );
}
