"use client";

import { useRouter } from "next/navigation";
import { ArrowRightOutlined, LoginOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ReactNode } from "react";

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

const features: Feature[] = [
  {
    title: "Tạo hồ sơ số",
    description: "Chuẩn hóa thông tin đất đai, dữ liệu tài sản và hồ sơ pháp lý trên một giao diện thống nhất.",
    icon: <DocumentIcon />,
  },
  {
    title: "Quản lý Sổ đỏ NFT",
    description: "Biến tài sản thành chứng nhận số có thể tra cứu, đối soát và kiểm chứng minh bạch.",
    icon: <RegistryIcon />,
  },
  {
    title: "Xác thực minh bạch",
    description: "Đối chiếu lịch sử biến động, trạng thái xác thực và dấu vết dữ liệu theo thời gian thực.",
    icon: <VerificationIcon />,
  },
];

export function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen text-slate-900">
      <LandingHeader router={router} />
      <HeroSection router={router} />
      <FeaturesSection />
      <CtaSection router={router} />
      <LandingFooter router={router} />
    </main>
  );
}

function LandingHeader({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <BuildingIcon />
          </div>
          <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-900 sm:text-[15px]">
            Quản lý đô thị thông minh
          </span>
        </div>

        <Button
          type="primary"
          icon={<LoginOutlined />}
          onClick={() => router.push("/in-development")}
          className="!h-10 !rounded-md !bg-blue-700 !px-4 !font-medium !shadow-none hover:!bg-blue-800"
        >
          Đăng nhập VNeID
        </Button>
      </div>
    </header>
  );
}

function HeroSection({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
      <div className="flex flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-100">
          <ShieldIcon />
          Hệ thống chính phủ số
        </div>

        <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
          Minh bạch hóa quản lý đất đai với công nghệ blockchain
        </h1>

        <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
          Hệ thống quản lý, lưu trữ và xác thực quyền sử dụng đất an toàn, nhanh chóng và hiện đại. Xây dựng niềm tin thông qua dữ liệu không thể thay đổi.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => router.push("/in-development")}
            className="!h-12 !rounded-md !bg-blue-700 !px-6 !font-semibold !shadow-none hover:!bg-blue-800"
          >
            Bắt đầu ngay
          </Button>

          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => router.push("/in-development")}
            className="!h-12 !rounded-md !border-slate-200 !px-6 !font-medium !text-slate-700 !shadow-none hover:!border-blue-200 hover:!text-blue-700"
          >
            Xem hướng dẫn
          </Button>
        </div>
      </div>

      <div className="relative flex items-center justify-center lg:justify-end">
        <CityScene />
      </div>
    </section>
  );
}

function CityScene() {
  return (
    <div className="relative aspect-[1/0.98] w-full max-w-[580px] overflow-hidden rounded-sm border border-slate-200 bg-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(96,165,250,0.32),transparent_26%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,0.25),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(51,65,85,0.8))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />

      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.82))]" />
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(180deg,rgba(15,23,42,0.2),rgba(15,23,42,0.9))]" />

      <div className="absolute left-4 top-8 h-28 w-20 rounded-sm bg-slate-700/80 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
      <div className="absolute left-16 bottom-0 h-56 w-16 rounded-t-sm bg-slate-700/90" />
      <div className="absolute left-28 bottom-0 h-72 w-12 rounded-t-sm bg-slate-600/80" />
      <div className="absolute left-40 bottom-0 h-44 w-20 rounded-t-sm bg-slate-700/90" />
      <div className="absolute left-60 bottom-0 h-64 w-16 rounded-t-sm bg-slate-600/85" />
      <div className="absolute left-[42%] bottom-0 h-80 w-20 rounded-t-sm bg-slate-700/80" />
      <div className="absolute right-36 bottom-0 h-96 w-16 rounded-t-sm bg-slate-500/85" />
      <div className="absolute right-20 bottom-0 h-72 w-20 rounded-t-sm bg-slate-700/80" />
      <div className="absolute right-5 bottom-0 h-52 w-14 rounded-t-sm bg-slate-600/90" />

      <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.92))]" />
      <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_65%_30%,rgba(34,211,238,0.18),transparent_14%),radial-gradient(circle_at_78%_44%,rgba(96,165,250,0.18),transparent_12%)]" />

      <div className="absolute left-7 top-[27%] z-10 w-44 rounded-lg border border-slate-100/80 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.22)]">
        <StatusCard
          icon={<MiniShieldIcon />}
          label="Trạng thái xác thực"
          value="Đã ký duyệt Web3"
          accent="text-blue-700"
        />
      </div>

      <div className="absolute right-7 bottom-[26%] z-10 w-52 rounded-lg border border-slate-100/80 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.22)]">
        <StatusCard
          icon={<MiniDotIcon />}
          label="Lịch sử biến động"
          value="Khớp dữ liệu 100%"
          accent="text-emerald-700"
        />
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/70">
        Smart City Blockchain
      </div>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className={`text-sm font-semibold ${accent}`}>{value}</div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="border-y border-slate-200/70 bg-white/80 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">Tính năng cốt lõi</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Hệ sinh thái số hóa toàn diện giúp đơn giản hóa quy trình hành chính và bảo vệ quyền lợi hợp pháp.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, icon }: Feature) {
  return (
    <article className="group rounded-sm border border-slate-200 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.92))] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-100 text-blue-700 ring-1 ring-blue-200/70 transition-colors group-hover:bg-blue-700 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}

function CtaSection({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-14 text-center text-white shadow-[0_24px_60px_rgba(29,78,216,0.24)] sm:px-10">
          <p className="text-lg font-semibold sm:text-xl">Bắt đầu trải nghiệm quản lý đất đai thế hệ mới</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
            Đăng nhập ngay hôm nay bằng tài khoản định danh điện tử VNeID để truy cập các dịch vụ hành chính công một cách nhanh chóng và minh bạch.
          </p>

          <div className="mt-8">
            <Button
              icon={<LoginOutlined />}
              onClick={() => router.push("/in-development")}
              className="!h-12 !rounded-md !border-0 !bg-white !px-6 !font-semibold !text-blue-700 !shadow-none hover:!bg-blue-50"
            >
              Đăng nhập bằng VNeID
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <footer className="border-t border-slate-200/80 bg-white/90 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2024 Hệ thống Quản lý Đô thị Thông minh. Nền tảng Registry Web3 Chính phủ.</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            onClick={() => router.push("/in-development")}
            className="transition-colors hover:text-blue-700"
          >
            Điều khoản sử dụng
          </button>
          <button
            onClick={() => router.push("/in-development")}
            className="transition-colors hover:text-blue-700"
          >
            Chính sách bảo mật
          </button>
          <button
            onClick={() => router.push("/in-development")}
            className="transition-colors hover:text-blue-700"
          >
            Liên hệ công tác
          </button>
          <button
            onClick={() => router.push("/in-development")}
            className="transition-colors hover:text-blue-700"
          >
            Cổng thông tin quốc gia
          </button>
        </div>
      </div>
    </footer>
  );
}

function BuildingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M4 20V6l7-3v17H4Zm10 0V3h6v17h-6ZM6 8h2v2H6V8Zm0 4h2v2H6v-2Zm0 4h2v2H6v-2Zm10-6h2v2h-2V8Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 18c-3.1-1.1-5.3-4.7-5.3-8.4V6.3L12 4.5l5.3 1.8v5.3c0 3.7-2.2 7.3-5.3 8.4Z" />
    </svg>
  );
}

function MiniShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M12 2 5 5v5c0 4.8 3.1 9.1 7 10.5 3.9-1.4 7-5.7 7-10.5V5l-7-3Zm-1 12-2.3-2.3 1.4-1.4L11 11.2l3.9-3.9 1.4 1.4L11 14Z" />
    </svg>
  );
}

function MiniDotIcon() {
  return <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />;
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M6 2h8l4 4v16H6V2Zm8 1.5V7h3.5L14 3.5ZM8 11h8v1.5H8V11Zm0 4h8v1.5H8V15Zm0-8h4v1.5H8V7Z" />
    </svg>
  );
}

function RegistryIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M4 4h16v16H4V4Zm2 2v3h12V6H6Zm0 5v7h12v-7H6Zm2 2h3v3H8v-3Zm5 0h3v3h-3v-3Z" />
    </svg>
  );
}

function VerificationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 3 4 7v5c0 5.2 3.7 9.9 8 11 4.3-1.1 8-5.8 8-11V7l-8-4Zm-1 13-3.5-3.5 1.4-1.4L11 13.2l4.1-4.1 1.4 1.4L11 16Z" />
    </svg>
  );
}
