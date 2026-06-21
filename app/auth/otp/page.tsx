import { Suspense } from "react";
import { OtpForm } from "@/components/dashboard/auth-card";

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
