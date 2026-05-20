import { Check } from "lucide-react";
import { RazorpayCheckout } from "./razorpay-checkout";
import { PLAN_FEATURES } from "@/lib/plans";
import type { BillingPlan } from "@/types/billing";

interface PricingPlanCardProps {
  plan: BillingPlan;
  current?: boolean;
  razorpayKeyId?: string;
  devMode?: boolean;
}

export function PricingPlanCard({
  plan,
  current,
  razorpayKeyId,
  devMode,
}: PricingPlanCardProps) {
  const popular = plan.id === "growth";
  const features = PLAN_FEATURES[plan.id] ?? [];

  return (
    <div
      className={`relative bg-white rounded-2xl border p-6 flex flex-col ${
        popular ? "border-brand-500 shadow-lg" : "border-gray-200"
      } ${current ? "ring-2 ring-brand-500" : ""}`}
    >
      {popular && !current && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      {current && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Current Plan
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
      <div className="text-3xl font-extrabold text-gray-900 mb-4">
        ₹{plan.priceInr.toLocaleString("en-IN")}
        <span className="text-base font-normal text-gray-500">/mo</span>
      </div>
      <ul className="space-y-2 flex-1 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {current ? (
        <button
          type="button"
          disabled
          className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : (
        <RazorpayCheckout
          planId={plan.id}
          planName={plan.name}
          amountPaise={plan.pricePaise}
          razorpayKeyId={razorpayKeyId}
          devMode={devMode}
        />
      )}
    </div>
  );
}
