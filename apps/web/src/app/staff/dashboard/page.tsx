import React from 'react';
import DashboardHeader from '@/components/staff/dashboard/DashboardHeader';
import QuickSearch from '@/components/staff/dashboard/QuickSearch';
import StatsChart from '@/components/staff/dashboard/StatsChart';
import TasksTable from '@/components/staff/dashboard/TasksTable';
import MapContext from '@/components/staff/dashboard/MapContext';
import SystemAlerts from '@/components/staff/dashboard/SystemAlerts';

export default function StaffDashboardPage() {
  return (
    <>
      <DashboardHeader />
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        <QuickSearch />
        <StatsChart />
        <TasksTable />
        <MapContext />
        <SystemAlerts />
      </div>
    </>
  );
}
