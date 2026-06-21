"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, apiErrorMessage } from "@/lib/api";

export function LoginForm() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const callbackUrl = getSafeCallbackUrl(params.get("callbackUrl"));
    setLoading(true);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      callbackUrl,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Login successful");
    window.location.assign(getSafeCallbackUrl(result?.url || callbackUrl));
  }

  return (
    <AuthPanel title="Welcome Back" subtitle="Sign in to manage YERR">
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <Input name="email" type="email" placeholder="Enter your email" required />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <PasswordInput name="password" placeholder="Enter your password" required />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>
        <Link href="/auth/forgot" className="block text-center text-sm text-muted-foreground">
          Forgot password?
        </Link>
      </form>
    </AuthPanel>
  );
}

export function ForgotForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      toast.success("OTP sent to your email");
      router.push(`/auth/otp?email=${encodeURIComponent(email)}&mode=reset`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPanel title="Forgot Password" subtitle="Request a password reset OTP">
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <Input name="email" type="email" required />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const mode = params.get("mode") || "verify";
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const otp = String(form.get("otp") || "");
    setLoading(true);
    try {
      if (mode === "reset") {
        router.push(`/auth/reset?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      } else {
        await api.verifyEmail({ email, otp });
        toast.success("Email verified");
        router.push("/auth/login");
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPanel title="Verify OTP" subtitle="Enter the code from your email">
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <Input name="email" value={email} readOnly />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">OTP</span>
          <Input name="otp" inputMode="numeric" required />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({
        email: params.get("email") || "",
        otp: params.get("otp") || "",
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successful");
      router.push("/auth/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPanel title="Reset Password" subtitle="Create a new admin password">
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium">New password</span>
          <PasswordInput name="newPassword" required />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Confirm password</span>
          <PasswordInput name="confirmPassword" required />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthPanel>
  );
}

function AuthPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-sidebar px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-background p-8 shadow-dashboard">
        <div className="mb-8 text-center">
          <p className="text-3xl font-semibold">YERR</p>
          <h1 className="mt-6 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="pr-12"
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

function getSafeCallbackUrl(value?: string | null) {
  if (!value) return "/";

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value.startsWith("/") && !value.startsWith("//") ? value : "/";
  }
}
