"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { ArrowLeftOutlined, FormOutlined } from "@ant-design/icons";

export function InDevelopmentPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-2xl w-full">
        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-200/20 blur-2xl rounded-full w-40 h-40 mx-auto" />
            <div className="relative bg-yellow-100 rounded-full p-6 w-40 h-40 flex items-center justify-center">
              <FormOutlined className="text-5xl text-yellow-700" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-black tracking-tight text-slate-950 mb-4 sm:text-5xl">
          Đang phát triển
        </h1>

        <p className="text-lg leading-8 text-slate-600 mb-2">
          Tính năng này đang được xây dựng
        </p>

        <p className="text-base leading-7 text-slate-500 mb-8">
          Chúng tôi đang làm việc chăm chỉ để mang đến trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau.
        </p>


        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="!h-12 !rounded-md !bg-blue-700 !px-6 !font-semibold !shadow-none hover:!bg-blue-800"
          >
            Quay lại
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="!h-12 !rounded-md !border-slate-200 !px-6 !font-medium !text-slate-700 !shadow-none hover:!border-blue-200 hover:!text-blue-700"
          >
            Về trang chủ
          </Button>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-slate-500">
          Theo dõi để cập nhật các tính năng mới
        </p>
      </div>
    </main>
  );
}
