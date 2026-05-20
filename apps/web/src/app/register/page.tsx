"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      businessName: "",
      password: "",
      confirmPassword: "",
      acceptTerms: undefined,
    },
  });

  const password = watch("password");

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const onSubmit = (values: RegisterInput) => {
    setErrorMessage("");
    registerUser(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        businessName: values.businessName,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("Account created! Let's set up your workspace.");
          router.push("/onboarding");
        },
        onError: (err) => {
          setErrorMessage(getApiErrorMessage(err, "Registration failed. Please try again."));
        },
      }
    );
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your 14-day free trial. No credit card required."
      footer={
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
            Sign in
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            placeholder="Arjun"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last name"
            placeholder="Mehta"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          label="Business email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Business name"
          placeholder="Mehta Clinic"
          autoComplete="organization"
          error={errors.businessName?.message}
          {...register("businessName")}
        />

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= passwordStrength
                      ? passwordStrength <= 2
                        ? "bg-amber-400"
                        : "bg-brand-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-brand-500 rounded"
              {...register("acceptTerms")}
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-brand-600 underline hover:text-brand-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-brand-600 underline hover:text-brand-700">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-red-500 mt-1">{errors.acceptTerms.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="md" loading={isPending}>
          Create free account
        </Button>
      </form>
    </AuthShell>
  );
}
