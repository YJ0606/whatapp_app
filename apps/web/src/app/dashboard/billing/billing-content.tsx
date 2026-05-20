"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, FileText, BarChart2, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useBillingOverview } from "@/hooks/use-billing";
import { PricingPlanCard } from "@/components/billing/pricing-plan-card";
import { PLAN_FEATURES } from "@/lib/plans";
import { Button } from "@/components/ui/button";

function BillingInner() {
  const searchParams = useSearchParams();
  const { data, isLoading, isError, refetch, isFetching } = useBillingOverview();

  useEffect(() => {
    if (searchParams.get("status") === "success") {
      toast.success("Subscription updated successfully!");
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-red-600 text-sm">Failed to load billing. Ensure the API is running.</p>
        <Button onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry
        </Button>
      </div>
    );
  }

  const { subscription, usage, plans } = data;
  const renewDate = subscription.currentPeriodEnd
    ? format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")
    : subscription.trialEndsAt
      ? `Trial ends ${format(new Date(subscription.trialEndsAt), "MMM d, yyyy")}`
      : "—";

  const msgPct = Math.min((usage.messages / usage.messageLimit) * 100, 100);
  const teamPct =
    usage.teamLimit != null
      ? Math.min((usage.teamMembers / usage.teamLimit) * 100, 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pay securely with Razorpay · Data scoped to your account only
          </p>
        </div>
        {isFetching && (
          <span className="text-xs text-brand-600 font-medium">Updating…</span>
        )}
      </div>

      <div className="bg-gradient-to-r from-brand-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-brand-100 mb-1">Current Plan</div>
            <h2 className="text-3xl font-bold mb-2">{subscription.planName} Plan</h2>
            <p className="text-brand-100">
              {subscription.status} · Renews {renewDate}
            </p>
            <p className="text-xs text-brand-200 mt-2">
              {usage.messages.toLocaleString()} / {usage.messageLimit.toLocaleString()} messages
              used this period
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
        {!data.razorpayConfigured && (
          <p className="mt-4 text-xs bg-white/10 rounded-lg px-3 py-2 text-brand-50">
            Razorpay keys not set — payments run in dev simulation mode. Add RAZORPAY_KEY_ID and
            RAZORPAY_KEY_SECRET to apps/api/.env for live checkout.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current Period Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">AI Messages</span>
              <span className="text-gray-500">
                {usage.messages.toLocaleString()} / {usage.messageLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${msgPct > 80 ? "bg-red-500" : "bg-brand-500"}`}
                style={{ width: `${msgPct}%` }}
              />
            </div>
          </div>
          {usage.teamLimit != null && (
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Team Members</span>
                <span className="text-gray-500">
                  {usage.teamMembers} / {usage.teamLimit} seats
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-brand-500"
                  style={{ width: `${teamPct}%` }}
                />
              </div>
            </div>
          )}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Catalog Items</span>
              <span className="text-gray-500">
                {usage.catalogItems} / {usage.catalogLimit}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-brand-500"
                style={{
                  width: `${Math.min((usage.catalogItems / usage.catalogLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Upgrade or change plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PricingPlanCard
              key={plan.id}
              plan={plan}
              current={subscription.planId === plan.id}
              razorpayKeyId={data.keyId}
              devMode={!data.razorpayConfigured}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/billing/invoices"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Invoices</div>
            <div className="text-sm text-gray-500">View billing history</div>
          </div>
        </Link>
        <Link
          href="/dashboard/billing/usage"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Usage Details</div>
            <div className="text-sm text-gray-500">Detailed usage breakdown</div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Your plan includes ({subscription.planName})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(PLAN_FEATURES[subscription.planId] ?? []).map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BillingContent() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <BillingInner />
    </Suspense>
  );
}
