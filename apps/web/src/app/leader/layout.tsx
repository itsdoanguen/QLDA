"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/leader/Sidebar';
import TopNavigation from '@/components/leader/TopNavigation';
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

export default function LeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        const data = response.data;
        
        // Security check: Only allow Staff or Admin (or Leader if there's a specific role)
        if (data.role?.roleCode === 'CITIZEN') {
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        localStorage.removeItem("accessToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600 font-medium">Đang tải hệ thống phê duyệt...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <TopNavigation />
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
