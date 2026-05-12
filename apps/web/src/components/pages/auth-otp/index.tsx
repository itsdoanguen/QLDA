"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LockFilled, QuestionCircleFilled } from "@ant-design/icons";
import { Button, App } from "antd";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 59;

export function AuthOtpPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(() => ["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setChallengeId(sessionStorage.getItem("challengeId"));
    const testOtp = sessionStorage.getItem("testOtp");
    if (testOtp && testOtp.length === OTP_LENGTH) {
      setOtp(testOtp.split(""));
    }
  }, []);

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

  const handleSubmit = async () => {
    if (!isComplete || isSubmitting) {
      return;
    }

    if (!challengeId) {
      message.error("Lỗi: Không tìm thấy challengeId");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        challengeId,
        otp: otpValue
      });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        
        const role = response.data.user?.roleCode;
        if (role === 'LANH_DAO') {
          router.push('/leader/dashboard');
        } else if (role === 'ADMIN' || role === 'CAN_BO') {
          router.push('/staff/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        message.error("Xác thực thất bại");
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      message.error(error?.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#191c1e] flex flex-col font-sans">
      <header className="border-b border-[#e1e2e4] bg-white">
        <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-[#0052cc]">
            <BuildingIcon />
            <span className="text-lg font-bold tracking-tight">
              SmartCity Urban Manager
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-[#434654] transition-colors hover:text-[#0052cc]"
          >
            <QuestionCircleFilled className="text-[#6b7280]" />
            Support
          </button>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-[480px] rounded border border-[#e1e2e4] bg-white p-10 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#eef2ff] text-[#0052cc]">
              <LockFilled className="text-2xl" />
            </div>

            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#111827]">
              Xác thực mã OTP
            </h1>
            <p className="text-[15px] leading-snug text-[#4b5563]">
              Một mã xác thực đã được gửi đến số điện thoại đăng ký
              <br />
              VNeID của bạn
            </p>
          </div>

          <form
            className="space-y-8"
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
                  className="h-[60px] w-[50px] rounded-sm border border-[#d1d5db] bg-white text-center text-[22px] font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] sm:h-[64px] sm:w-[54px]"
                  placeholder={index >= otpValue.length ? "-" : undefined}
                />
              ))}
            </div>

            <Button
              htmlType="submit"
              type="primary"
              disabled={!isComplete || isSubmitting}
              className="!h-12 !w-full !rounded-sm !border-0 !bg-[#0b57d0] !text-[15px] !font-medium !text-white !shadow-none transition-colors hover:!bg-[#0842a0] disabled:!bg-[#e5e7eb] disabled:!text-[#9ca3af]"
            >
              {isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
            </Button>

            <div className="text-center text-[14px] text-[#4b5563]">
              Chưa nhận được mã?{" "}
              <span className="text-[#9ca3af]">
                Gửi lại mã ({secondsLeft}s)
              </span>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#e1e2e4] bg-[#f8f9fa]">
        <div className="mx-auto flex w-full flex-col gap-4 px-6 py-5 text-[13px] text-[#6b7280] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 Smart City Urban Management. VNeID Secure Access.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button type="button" className="transition-colors hover:text-[#374151]">
              Terms of Service
            </button>
            <button type="button" className="transition-colors hover:text-[#374151]">
              Privacy Policy
            </button>
            <button type="button" className="transition-colors hover:text-[#374151]">
              Technical Support
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

function BuildingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M4 20V6l7-3v17H4Zm10 0V3h6v17h-6ZM6 8h2v2H6V8Zm0 4h2v2H6v-2Zm0 4h2v2H6v-2Zm10-6h2v2h-2V8Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Z" />
    </svg>
  );
}