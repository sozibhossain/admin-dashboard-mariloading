import { Suspense } from "react";
import { LoginForm } from "@/components/dashboard/auth-card";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
