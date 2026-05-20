"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/hooks/use-auth";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { mutate: requestReset, isPending } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    requestReset(email, {
      onSuccess: () => {
        setSent(true);
        toast.success("Reset link sent if the email exists in our system.");
      },
      onError: () => {
        setErrorMessage("Unable to send reset email. Please try again later.");
      },
    });
  };

  return (
    <AuthShell
      title={sent ? "Check your email" : "Forgot password?"}
      subtitle={
        sent
          ? "If an account exists for that email, we've sent reset instructions."
          : "Enter your work email and we'll send a secure reset link."
      }
      footer={
        <Link
          href="/login"
          className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ✉️
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Didn&apos;t receive it? Check spam or{" "}
            <button
              type="button"
              className="text-brand-600 font-medium hover:text-brand-700"
              onClick={() => setSent(false)}
            >
              try again
            </button>
          </p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />
          <Button type="submit" className="w-full" loading={isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
