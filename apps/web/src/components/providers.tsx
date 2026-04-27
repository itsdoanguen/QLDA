"use client";

import type { ReactNode } from "react";

import { ConfigProvider, theme } from "antd";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1d4ed8",
          borderRadius: 12,
          fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        components: {
          Button: {
            borderRadius: 10,
            controlHeight: 42,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}