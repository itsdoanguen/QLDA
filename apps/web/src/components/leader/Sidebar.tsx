import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <aside className="flex flex-col fixed left-0 top-0 h-full py-4 bg-white border-r border-gray-200 w-64 z-40 hidden md:flex">
      <div className="px-6 mb-10 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0c56d0] rounded flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <Link 
          href="/leader/search" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
            isActive('/leader/search') 
              ? 'bg-blue-50 text-[#0c56d0] font-bold border-r-4 border-[#0c56d0]' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">manage_search</span>
          <span>Tra cứu</span>
        </Link>
        <Link 
          href="/leader/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
            isActive('/leader/dashboard') || isActive('/leader/processing')
              ? 'bg-blue-50 text-[#0c56d0] font-bold border-r-4 border-[#0c56d0]' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">edit_document</span>
          <span>Ký duyệt</span>
        </Link>
        <Link 
          href="/leader/reports" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
            isActive('/leader/reports') 
              ? 'bg-blue-50 text-[#0c56d0] font-bold border-r-4 border-[#0c56d0]' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          <span>Báo cáo</span>
        </Link>
        <Link 
          href="/leader/recovery" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
            isActive('/leader/recovery') 
              ? 'bg-blue-50 text-[#0c56d0] font-bold border-r-4 border-[#0c56d0]' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">vpn_key</span>
          <span>Khôi phục ví</span>
        </Link>
      </nav>
    </aside>
  );
}
