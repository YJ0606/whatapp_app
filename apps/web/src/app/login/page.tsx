"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validators";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginInput) => {
    setErrorMessage("");
    login(values, {
      onSuccess: () => {
        toast.success("Welcome back!");
        router.push(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
      },
      onError: (err) => {
        setErrorMessage(getApiErrorMessage(err, "Invalid email or password. Please try again."));
      },
    });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your WaAI enterprise workspace"
      footer={
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-600 font-medium hover:text-brand-700">
            Start free trial
          </Link>
        </p>
      }
    >
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Work email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors pr-10 ${
                errors.password
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" className="rounded accent-brand-500" />
          Keep me signed in for 30 days
        </label>

        <Button type="submit" className="w-full" size="md" loading={isPending}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
