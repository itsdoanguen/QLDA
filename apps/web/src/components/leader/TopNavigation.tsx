import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  
  let pageTitle = "Smart City Land Registry";
  if (pathname?.includes('/dashboard')) pageTitle = "Dashboard Phê duyệt";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className={`text-xl font-bold m-0 ${pathname?.includes('/dashboard') ? 'text-gray-900' : 'text-[#0c56d0]'}`}>
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-96">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Tìm kiếm mã hồ sơ..." 
            className="bg-gray-50 border-transparent hover:border-gray-300 focus:bg-white rounded-lg py-1.5"
          />
        </div>

        <div className="flex items-center gap-3 ml-4">
          <div className="text-right">
            <div className="text-[14px] font-bold text-[#111827] leading-none mb-1">Cán bộ Thử nghiệm</div>
            <div className="text-[11px] text-[#6b7280] font-medium uppercase tracking-wider">LÃNH ĐẠO CHI NHÁNH</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#eef2ff] border border-[#d1daff] flex items-center justify-center text-[#0052cc] text-lg">
            <UserOutlined />
          </div>
          <div className="w-[1px] h-6 bg-[#e1e2e4] mx-2"></div>
          <Button
            type="text"
            icon={<LogoutOutlined className="text-lg" />}
            onClick={() => router.push("/")}
            className="!text-[#4b5563] hover:!text-red-500 hover:!bg-red-50 !w-10 !h-10 !rounded-full"
            title="Đăng xuất"
          />
        </div>
      </div>
    </header>
  );
}
