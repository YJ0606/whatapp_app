"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import apiClient from "@/lib/api-client";
import { unwrapApiData } from "@/lib/api-response";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/auth-provider";
import { useInvalidateBilling } from "@/hooks/use-billing";
import type { RazorpayOrder } from "@/types/billing";
import toast from "react-hot-toast";

interface RazorpayCheckoutProps {
  planId: string;
  planName: string;
  amountPaise: number;
  razorpayKeyId?: string;
  devMode?: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function RazorpayCheckout({
  planId,
  planName,
  amountPaise,
  razorpayKeyId,
  devMode,
}: RazorpayCheckoutProps) {
  const router = useRouter();
  const { user } = useAuth();
  const invalidateBilling = useInvalidateBilling();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const publicKey =
    razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

  useEffect(() => {
    if (devMode) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [devMode]);

  const completeDevPayment = async (order: RazorpayOrder) => {
    const { data } = await apiClient.post("/billing/verify-payment", {
      paymentId: `pay_dev_${Date.now()}`,
      orderId: order.id,
      signature: "dev_mode",
      planId,
    });
    unwrapApiData(data);
    invalidateBilling();
    toast.success(`Upgraded to ${planName}!`);
    router.push("/dashboard/billing?status=success");
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await apiClient.post<{ data: RazorpayOrder }>("/billing/checkout", {
        planId,
      });
      const order = unwrapApiData<RazorpayOrder>(data);

      if (order.devMode || devMode) {
        await completeDevPayment(order);
        setLoading(false);
        return;
      }

      if (!publicKey) {
        throw new Error("Razorpay key is not configured. Add RAZORPAY_KEY_ID to your API .env.");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Check your connection.");
      }

      const options = {
        key: order.keyId || publicKey,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.id,
        name: "WaAI",
        description: `Upgrade to ${planName} Plan`,
        prefill: {
          email: user?.email ?? "",
          name: user ? `${user.firstName} ${user.lastName}` : "",
        },
        theme: { color: "#25D366" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await apiClient.post("/billing/verify-payment", {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              planId,
            });
            unwrapApiData(verifyRes.data);
            invalidateBilling();
            toast.success("Payment successful!");
            router.push("/dashboard/billing?status=success");
          } catch (err) {
            setError(getApiErrorMessage(err, "Payment verification failed"));
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to initiate payment"));
      setLoading(false);
    }
  };

  const priceInr = Math.round(amountPaise / 100);

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ₹{priceInr.toLocaleString("en-IN")} / mo
          </>
        )}
      </button>
      {devMode && (
        <p className="text-xs text-amber-600 text-center">
          Dev mode: payment will be simulated (no Razorpay keys configured)
        </p>
      )}
    </div>
  );
}
