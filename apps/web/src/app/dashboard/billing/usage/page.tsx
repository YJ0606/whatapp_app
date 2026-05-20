"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UsageMeter } from "@/components/billing/usage-meter";
import { useBillingUsage } from "@/hooks/use-billing";

export default function UsageDetailsPage() {
  const { data, isLoading } = useBillingUsage();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Usage Details</h1>
        <p className="text-gray-500 text-sm mt-1">Live usage for your workspace this billing period.</p>
      </div>
      <UsageMeter items={data?.items ?? []} loading={isLoading} />
    </div>
  );
}
