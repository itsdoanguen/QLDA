"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function LeaderRecordsPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to dashboard as default view for records 
    // or you could build a dedicated list view here.
    router.replace('/leader/dashboard');
  }, [router]);

  return null;
}
