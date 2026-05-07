import React from 'react';
import { StaffLayout } from "@/components/layouts/StaffLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffLayout>
      {children}
    </StaffLayout>
  );
}
