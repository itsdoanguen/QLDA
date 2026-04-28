import { Suspense } from "react";
import { AuthOtpPage } from "@/components/pages/auth-otp";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthOtpPage />
    </Suspense>
  );
}