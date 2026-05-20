"use client";

import { Loader2 } from "lucide-react";
import type { BillingUsageItem } from "@/types/billing";

interface UsageMeterProps {
  items: BillingUsageItem[];
  loading?: boolean;
}

export function UsageMeter({ items, loading }: UsageMeterProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const hasLimit = item.total !== null && item.total > 0;
        const pct = hasLimit ? Math.min((item.used / item.total!) * 100, 100) : 0;

        return (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500">
                  {item.used.toLocaleString()}{" "}
                  {hasLimit
                    ? `/ ${item.total!.toLocaleString()} ${item.unit}`
                    : `${item.unit} (unlimited)`}
                </div>
              </div>
            </div>
            {hasLimit && (
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-brand-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
