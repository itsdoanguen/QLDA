import { Select } from 'antd';

interface FinancialReportProps {
  data: {
    totalRevenue: string;
    completionRate: string;
    monthlyData: { month: string; value: number }[];
  };
}

export default function FinancialReport({ data }: FinancialReportProps) {
  // Generate colors from light to dark blue based on index
  const colors = ["#cbd5e1", "#94a3b8", "#0052cc", "#64748b", "#3b82f6", "#1e3a8a"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold text-gray-900">Báo cáo tài chính: Thuế & Lệ phí</h3>
        <Select defaultValue="6thángqua" options={[{ value: '6thángqua', label: '6 tháng qua' }]} className="w-32" size="small" />
      </div>

      <div className="flex-1 min-h-[200px] flex items-end gap-6 justify-between mb-8 px-2">
        {data.monthlyData.map((item, index) => (
          <div 
            key={index} 
            className="w-full rounded-t-sm flex flex-col justify-end items-center relative group transition-all hover:opacity-80"
            style={{ height: `${item.value}%`, backgroundColor: colors[index % colors.length] }}
          >
            <span className="text-[10px] text-gray-500 absolute -bottom-5 font-medium whitespace-nowrap">{item.month}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-6 grid grid-cols-2 mt-4 gap-8">
        <div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng doanh thu kỳ này</div>
          <div className="text-xl font-bold text-gray-900">{data.totalRevenue}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tỷ lệ hoàn thành kế hoạch</div>
          <div className="text-xl font-bold text-gray-900">{data.completionRate}</div>
        </div>
      </div>
    </div>
  );
}
