"use client";

import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import type { BillingInvoice } from "@/types/billing";

const badgeColor: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  OVERDUE: "bg-red-50 text-red-700",
  SENT: "bg-yellow-50 text-yellow-700",
  DRAFT: "bg-gray-100 text-gray-600",
  VOID: "bg-gray-100 text-gray-500",
};

interface InvoiceListProps {
  invoices: BillingInvoice[];
  loading?: boolean;
}

export function InvoiceList({ invoices, loading }: InvoiceListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-500">
        No invoices yet. Upgrade a plan to see your first invoice here.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Invoice</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Period</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-gray-700 text-xs">{inv.invoiceNumber}</td>
              <td className="px-4 py-3 text-gray-700">{inv.period}</td>
              <td className="px-4 py-3 font-semibold text-gray-900">
                ₹{inv.amount.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    badgeColor[inv.status] ?? badgeColor.DRAFT
                  }`}
                >
                  {inv.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {format(new Date(inv.date), "MMM d, yyyy")}
                {inv.paidAt && (
                  <span className="block text-green-600">
                    Paid {format(new Date(inv.paidAt), "MMM d")}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Download invoice (coming soon)"
                  aria-label="Download invoice"
                >
                  <Download className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
