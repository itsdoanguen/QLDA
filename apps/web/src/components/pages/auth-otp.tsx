"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  LockOutlined,
  MailOutlined,
  ReloadOutlined,
  SafetyOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/navigation";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 59;

export function AuthOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(() => ["8", "4", "9", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otpValue = useMemo(() => otp.join(""), [otp]);
  const isComplete = otp.every((digit) => digit.length === 1);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    const currentInput = inputRefs.current[activeIndex];
    currentInput?.focus();
  }, [activeIndex]);

  const updateDigit = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);

    setOtp((current) => {
      const next = [...current];
      next[index] = nextValue;
      return next;
    });

    if (nextValue && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      setActiveIndex(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pastedDigits) {
      return;
    }

    setOtp(pastedDigits.split("").concat(Array.from({ length: OTP_LENGTH - pastedDigits.length }, () => "")));
    setActiveIndex(Math.min(pastedDigits.length, OTP_LENGTH - 1));
  };

  const handleResend = () => {
    setSecondsLeft(RESEND_SECONDS);
  };

  const handleSubmit = async () => {
    if (!isComplete || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => setIsSubmitting(false), 600);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,82,204,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.05),transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8f9fb_100%)] text-[#191c1e]">
      <header className="border-b border-[#e1e2e4] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-[#434654] transition-colors hover:bg-[#f3f4f6] hover:text-[#0052cc]"
          >
            <ArrowLeftOutlined />
            Trở lại
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0052cc]/10 text-[#0052cc] ring-1 ring-[#0052cc]/10">
              <SafetyOutlined />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#737685]">SmartCity Urban Manager</p>
              <p className="text-sm font-semibold text-[#191c1e]">Xác thực VNeID</p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#434654] transition-colors hover:bg-[#f3f4f6] hover:text-[#0052cc]"
          >
            <QuestionCircleOutlined />
            Hỗ trợ
          </button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.98fr] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c3c6d6] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0040a2] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <LockOutlined className="text-[#0052cc]" />
            Kênh xác thực an toàn
          </div>

          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-[#191c1e] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.02]">
            Nhập mã OTP để tiếp tục truy cập hệ thống
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#434654] sm:text-lg">
            Mã xác thực đã được gửi đến số điện thoại đăng ký VNeID của bạn. Hoàn tất bước này để tiếp tục kiểm tra hồ sơ, xác thực giao dịch và truy cập dịch vụ công.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoTile
              icon={<MailOutlined />}
              title="Kênh nhận mã"
              description="Số điện thoại đã được che bớt: 098****123"
            />
            <InfoTile
              icon={<SafetyOutlined />}
              title="Bảo mật phiên"
              description="Mã chỉ có hiệu lực trong một khoảng thời gian ngắn"
            />
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[520px] rounded-[8px] border border-[#e1e2e4] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#dae2ff] text-[#0052cc] ring-1 ring-[#b2c5ff]">
                <LockOutlined className="text-2xl" />
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-[#191c1e]">Xác thực mã OTP</h2>
              <p className="mt-3 text-sm leading-6 text-[#434654]">
                Nhập 6 chữ số được gửi đến thiết bị đăng ký của bạn để hoàn tất xác minh.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      inputRefs.current[index] = node;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onFocus={() => setActiveIndex(index)}
                    aria-label={`Nhập số OTP thứ ${index + 1}`}
                    className="h-14 w-12 rounded-md border border-[#e1e2e4] bg-[#ffffff] text-center text-2xl font-semibold tracking-[0.18em] text-[#191c1e] outline-none transition-colors placeholder:text-[#c3c6d6] focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/15 sm:h-16 sm:w-14"
                    placeholder={index >= otpValue.length ? "-" : undefined}
                  />
                ))}
              </div>

              <Button
                htmlType="submit"
                type="primary"
                disabled={!isComplete || isSubmitting}
                icon={isSubmitting ? undefined : <CheckCircleFilled />}
                className="!h-12 !w-full !rounded-md !border-0 !bg-[#0052cc] !font-semibold !text-white !shadow-none transition-colors hover:!bg-[#0040a2] disabled:!bg-[#c3c6d6] disabled:!text-white"
              >
                {isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
              </Button>

              <div className="rounded-md border border-[#e1e2e4] bg-[#f3f4f6] px-4 py-3 text-sm text-[#434654]">
                <p className="leading-6">
                  {isComplete
                    ? `Mã đã nhập: ${otpValue}`
                    : "Vui lòng nhập đủ 6 chữ số để xác thực phiên đăng nhập."}
                </p>
              </div>

              <div className="text-center text-sm leading-6 text-[#434654]">
                Chưa nhận được mã?{" "}
                {secondsLeft > 0 ? (
                  <span className="font-medium text-[#737685]">Gửi lại mã ({secondsLeft}s)</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center gap-2 font-semibold text-[#0052cc] transition-colors hover:text-[#0040a2]"
                  >
                    <ReloadOutlined />
                    Gửi lại mã
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e1e2e4] bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-[#434654] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2024 Smart City Urban Management. VNeID Secure Access.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button type="button" className="transition-colors hover:text-[#0052cc]">
              Terms of Service
            </button>
            <button type="button" className="transition-colors hover:text-[#0052cc]">
              Privacy Policy
            </button>
            <button type="button" className="transition-colors hover:text-[#0052cc]">
              Technical Support
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

function InfoTile({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md border border-[#e1e2e4] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f3f4f6] text-[#0052cc] ring-1 ring-[#e1e2e4]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#191c1e]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#434654]">{description}</p>
        </div>
      </div>
    </div>
  );
}