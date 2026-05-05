import React from 'react';
import TopNavigation from '@/components/staff/TopNavigation';
import Sidebar from '@/components/staff/Sidebar';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-body-md text-on-surface bg-background min-h-screen">
      <TopNavigation />
      <Sidebar />
      <main className="md:ml-64 p-lg lg:p-margin transition-all">
        {children}
      </main>
    </div>
  );
}
