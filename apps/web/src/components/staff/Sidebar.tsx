import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="flex flex-col fixed left-0 top-0 h-full py-4 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 w-64 z-40 hidden md:flex">
      <div className="px-6 mb-xl mt-16">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Quản lý Đất đai</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Hệ thống Blockchain</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-unit">
        <Link 
          href="/staff/dashboard" 
          className="flex items-center gap-md px-4 py-3 bg-gray-100 dark:bg-gray-900 text-blue-700 dark:text-blue-400 border-r-4 border-blue-700 dark:border-blue-500 font-medium transition-all duration-200"
        >
          <span className="material-symbols-outlined">folder_shared</span>
          <span>Hồ sơ</span>
        </Link>
        <Link 
          href="#" 
          className="flex items-center gap-md px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
        >
          <span className="material-symbols-outlined">manage_search</span>
          <span>Tra cứu</span>
        </Link>
        <Link 
          href="#" 
          className="flex items-center gap-md px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>Báo cáo</span>
        </Link>
      </nav>
      
      <div className="px-4 mt-auto">
        <button className="w-full flex items-center gap-md px-4 py-3 text-error hover:bg-error-container/20 rounded transition-colors">
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
