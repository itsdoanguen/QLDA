"use client";

import React, { useEffect, useState } from 'react';
import DashboardHeader from '@/components/staff/dashboard/DashboardHeader';
import StatsChart from '@/components/staff/dashboard/StatsChart';
import TasksTable from '@/components/staff/dashboard/TasksTable';
import MapContext from '@/components/staff/dashboard/MapContext';
import { api } from '@/utils/api';
import { App } from 'antd';

export default function StaffDashboardPage() {
  const { message } = App.useApp();
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/land-records/staff/tasks'),
        api.get('/land-records/staff/stats')
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      
      // Auto-select first record if available
      if (tasksRes.data.length > 0 && !selectedRecord) {
        setSelectedRecord(tasksRes.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch staff data", error);
      message.error("Không thể tải dữ liệu cán bộ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <DashboardHeader stats={stats} />
      
      <div className="grid grid-cols-12 gap-8">
        {/* Left Side: Stats and Tasks */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <StatsChart stats={stats} />
          <TasksTable 
            tasks={tasks} 
            loading={loading} 
            onRefresh={fetchData}
            onSelectRecord={(record: any) => setSelectedRecord(record)}
            selectedId={selectedRecord?.id}
          />
        </div>

        {/* Right Side: Map Context */}
        <div className="col-span-12 lg:col-span-4">
          <MapContext record={selectedRecord} />
        </div>
      </div>
    </div>
  );
}
