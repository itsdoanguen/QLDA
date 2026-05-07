import React from 'react';
import Link from 'next/link';

export default function TopNavigation() {
  return (
    <header className="bg-white dark:bg-gray-950 flex justify-between items-center h-16 px-6 w-full sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 font-inter text-sm antialiased">
      <div className="flex items-center gap-md">
        <Link href="/staff/dashboard" className="text-lg font-bold tracking-tight text-blue-700 dark:text-blue-500">
          Smart City Land Registry
        </Link>
        <div className="hidden md:flex ml-xl gap-md">
          <Link href="/staff/dashboard" className="text-blue-700 dark:text-blue-400 font-semibold transition-colors">Hồ sơ</Link>
          <span className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer px-sm py-xs rounded">Tra cứu</span>
          <span className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer px-sm py-xs rounded">Báo cáo</span>
        </div>
      </div>
      
      <div className="flex items-center gap-md">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">manage_search</span>
          <input 
            className="pl-xl pr-md py-sm bg-surface-container border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-container w-64" 
            placeholder="Tìm kiếm nhanh..." 
            type="text"
          />
        </div>
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 cursor-pointer active:opacity-80">notifications</span>
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 cursor-pointer active:opacity-80">help_outline</span>
        <img 
          alt="Administrator profile photo" 
          className="w-8 h-8 rounded-full border border-outline-variant" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcuaV_0sZfWsTV1GIKi1emr8VbSZ9-F8BLdQjVnnFriwBYF_lstD-UJgwUgP3kBfU4o5CwOs1aLLtqOvydP60bXF7QRnboFR6oMkDF65y9OZRo0ot2b_Z6wiS6f0iIhH_7Lqf0B4ewF_h0GQGKEdC82DFRRQNDW7cM4FeGaUk56-NkAbXfIpYjsaKu4b4rKgEtQGSvR_6erVs_b6UbCGMl9AgDB79gYCPpX6CxOdXAjwpJrsfygvot1MWp8h5EaUU7lvhq2fBeM68"
        />
      </div>
    </header>
  );
}
