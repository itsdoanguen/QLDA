interface DepartmentProgressProps {
  data: {
    name: string;
    note?: string;
    progress: number;
    status: string;
    color: string;
  }[];
}

export default function DepartmentProgress({ data }: DepartmentProgressProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6">Tiến độ xử lý theo phòng ban (Nhận diện nút thắt)</h3>
      
      <div className="space-y-6">
        {data.map((dept, index) => (
          <div key={index}>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-700 font-medium">
                {dept.name} 
                {dept.note && <span className="text-red-500 text-[10px] ml-1 font-bold">{dept.note}</span>}
              </span>
              <span className="font-mono font-medium text-[10px]" style={{ color: dept.color }}>
                {dept.progress}% - {dept.status}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${dept.progress}%`, backgroundColor: dept.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
