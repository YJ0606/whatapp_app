"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InvoiceList } from "@/components/billing/invoice-list";
import { useBillingInvoices } from "@/hooks/use-billing";

export default function InvoicesPage() {
  const { data, isLoading } = useBillingInvoices();

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
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 text-sm mt-1">Your complete billing history from Razorpay payments.</p>
      </div>
      <InvoiceList invoices={data ?? []} loading={isLoading} />
    </div>
  );
}
