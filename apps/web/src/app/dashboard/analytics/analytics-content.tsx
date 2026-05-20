"use client";

import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";

export function AnalyticsContent() {
  const { data, isLoading, isError, refetch } = useAnalytics();

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
        <p className="text-red-600 text-sm">Failed to load analytics.</p>
        <Button onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry
        </Button>
      </div>
    );
  }

  const maxVal = Math.max(...data.weeklyVolume.map((d) => d.messages), 1);
  const totalBreakdown = data.breakdown.reduce((s, b) => s + b.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Live insights for your WhatsApp AI workspace.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Messages (month)", value: data.monthMessages.toLocaleString() },
          { label: "AI Resolution", value: `${data.aiResolutionRate}%` },
          { label: "Conversations", value: data.conversations.toLocaleString() },
          { label: "Human Handoffs", value: data.humanHandoffs.toLocaleString() },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Last 7 Days</h3>
        {data.weeklyVolume.every((d) => d.messages === 0) ? (
          <p className="text-sm text-gray-500 text-center py-12">No message data yet this week.</p>
        ) : (
          <>
            <div className="flex items-end gap-3 h-48">
              {data.weeklyVolume.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-40">
                    <div
                      className="flex-1 bg-brand-500 rounded-t opacity-80"
                      style={{ height: `${(d.messages / maxVal) * 100}%` }}
                      title={`Messages: ${d.messages}`}
                    />
                    <div
                      className="flex-1 bg-brand-200 rounded-t opacity-80"
                      style={{ height: `${(d.resolved / maxVal) * 100}%` }}
                      title={`Resolved: ${d.resolved}`}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-brand-500" /> Messages
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-brand-200" /> Resolved
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
          <div className="space-y-3">
            {data.breakdown.map((item) => {
              const pct = Math.round((item.count / totalBreakdown) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <Link href="/dashboard/conversations" className="block text-brand-600 hover:underline">
              → Conversations ({data.conversations})
            </Link>
            <Link href="/dashboard/bookings" className="block text-brand-600 hover:underline">
              → Bookings ({data.bookings} this month)
            </Link>
            <Link href="/dashboard/orders" className="block text-brand-600 hover:underline">
              → Orders ({data.orders} this month)
            </Link>
            <Link href="/dashboard/billing" className="block text-brand-600 hover:underline">
              → Billing & usage limits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
