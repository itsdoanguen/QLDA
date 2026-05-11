interface RealTimeStatsProps {
  data: {
    completionRate: number;
    approved: string;
    processing: string;
    backlog: string;
  };
}

export default function RealTimeStats({ data }: RealTimeStatsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col items-center shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 w-full mb-8">Thống kê hồ sơ thời gian thực</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <div className="w-full h-full border-[20px] border-[#0052cc] border-t-gray-100 rounded-full flex flex-col items-center justify-center transform -rotate-45">
          <div className="transform rotate-45 text-center mt-2">
            <div className="text-4xl font-black text-gray-900 leading-none">{data.completionRate}%</div>
            <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Hoàn thành</div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0052cc]"></span>
            <span className="text-gray-600 text-xs font-medium">Đã duyệt</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">{data.approved}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]"></span>
            <span className="text-gray-600 text-xs font-medium">Đang xử lý</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">{data.processing}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]"></span>
            <span className="text-gray-600 text-xs font-medium">Tồn đọng</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">{data.backlog}</span>
        </div>
      </div>
    </div>
  );
}
