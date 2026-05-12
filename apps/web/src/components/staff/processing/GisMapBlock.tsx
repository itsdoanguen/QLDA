import { GlobalOutlined, PlusOutlined, MinusOutlined, BuildOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import dynamic from 'next/dynamic';

const MapPolygonPicker = dynamic(() => import('@/components/shared/MapPolygonPicker'), { ssr: false });

export default function GisMapBlock({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col min-h-[600px]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="font-bold text-gray-900 m-0 flex items-center gap-2 text-base">
          <span className="text-[#0052cc]"><GlobalOutlined /></span> 
          3. Bản đồ GIS
        </h3>
        <div className="flex gap-2">
          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">{data.system}</span>
          <span className="bg-[#0052cc] text-white text-[10px] font-bold px-2 py-1 rounded">{data.status}</span>
        </div>
      </div>

      <div className="flex-1 bg-[#e5e7eb] rounded-lg border border-gray-200 relative overflow-hidden min-h-[500px]">
        <div className="absolute inset-0">
          <MapPolygonPicker disabled={true} value={data.center} />
        </div>
        
        {/* Mock map controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <Button icon={<PlusOutlined />} className="bg-white shadow-sm border-gray-200 text-gray-600" />
          <Button icon={<MinusOutlined />} className="bg-white shadow-sm border-gray-200 text-gray-600" />
          <Button icon={<BuildOutlined />} className="bg-white shadow-sm border-gray-200 text-gray-600 mt-2" />
        </div>

        {/* Mock polygon label */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-[#0052cc] text-[#0052cc] text-[10px] font-bold px-3 py-1.5 rounded shadow-sm">
          {data.polygon}
        </div>
      </div>
    </div>
  );
}
