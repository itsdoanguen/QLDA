import type { Metadata } from "next";

import "antd/dist/reset.css";

import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Quản lý đô thị thông minh",
  description: "Landing page cho hệ thống quản lý đô thị thông minh dựa trên blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}