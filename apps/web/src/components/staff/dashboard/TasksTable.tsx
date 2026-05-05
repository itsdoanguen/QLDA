import React from 'react';

export default function TasksTable() {
  return (
    <div className="col-span-12 bg-white border border-outline-variant rounded overflow-hidden">
      <div className="p-lg border-b border-surface-container flex items-center justify-between bg-surface-container-lowest">
        <h3 className="font-h3 text-h3 text-on-surface">Danh sách hồ sơ cần đối soát</h3>
        <div className="flex gap-sm">
          <button className="p-xs hover:bg-surface-container rounded transition-colors">
            <span className="material-symbols-outlined text-secondary">filter_list</span>
          </button>
          <button className="p-xs hover:bg-surface-container rounded transition-colors">
            <span className="material-symbols-outlined text-secondary">refresh</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-lg py-md text-label-sm uppercase text-secondary font-bold tracking-wider">Mã hồ sơ</th>
              <th className="px-lg py-md text-label-sm uppercase text-secondary font-bold tracking-wider">Loại giao dịch</th>
              <th className="px-lg py-md text-label-sm uppercase text-secondary font-bold tracking-wider">Người nộp</th>
              <th className="px-lg py-md text-label-sm uppercase text-secondary font-bold tracking-wider text-center">Thời gian</th>
              <th className="px-lg py-md text-label-sm uppercase text-secondary font-bold tracking-wider">Độ sạch dữ liệu</th>
              <th className="px-lg py-md text-label-sm uppercase text-secondary font-bold tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {/* Row 1 */}
            <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer group">
              <td className="px-lg py-md font-mono-data text-primary font-semibold">HS-2024-0891</td>
              <td className="px-lg py-md text-body-md">Chuyển nhượng QSDĐ</td>
              <td className="px-lg py-md text-body-md">Nguyễn Văn An</td>
              <td className="px-lg py-md text-body-md text-center text-secondary">14:20 - 22/05/2024</td>
              <td className="px-lg py-md">
                <div className="flex items-center gap-sm">
                  <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%]"></div>
                  </div>
                  <span className="text-label-sm font-bold text-primary">85%</span>
                </div>
              </td>
              <td className="px-lg py-md">
                <button className="text-primary hover:underline font-medium text-body-md">Làm sạch</button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer group">
              <td className="px-lg py-md font-mono-data text-primary font-semibold">HS-2024-0892</td>
              <td className="px-lg py-md text-body-md">Thế chấp ngân hàng</td>
              <td className="px-lg py-md text-body-md">Lê Thị Bình</td>
              <td className="px-lg py-md text-body-md text-center text-secondary">09:15 - 22/05/2024</td>
              <td className="px-lg py-md">
                <div className="flex items-center gap-sm">
                  <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary-container w-[45%]"></div>
                  </div>
                  <span className="text-label-sm font-bold text-tertiary">45%</span>
                </div>
              </td>
              <td className="px-lg py-md">
                <button className="text-primary hover:underline font-medium text-body-md">Làm sạch</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="p-md bg-surface-container-low flex justify-between items-center px-lg border-t border-surface-container">
        <span className="text-label-sm text-secondary">Hiển thị 2 trên 12 hồ sơ chờ xử lý</span>
        <div className="flex gap-xs">
          <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-white transition-colors text-secondary"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-label-sm font-bold">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-white transition-colors text-label-sm font-medium">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-white transition-colors text-label-sm font-medium">3</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-white transition-colors text-secondary"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
        </div>
      </div>
    </div>
  );
}
