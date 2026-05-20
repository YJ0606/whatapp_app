"use client";

import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { UsageWidget } from "@/components/dashboard/usage-widget";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { AdminBadge } from "@/components/dashboard/admin-badge";
import {
  MessageSquare,
  Calendar,
  ShoppingCart,
  Users,
  Zap,
  TrendingUp,
  RefreshCw,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";

export function DashboardContent() {
  const { data, isLoading, isFetching, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
        <p className="text-sm text-red-600">Could not load live dashboard. Is the API running?</p>
        <Button onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry
        </Button>
      </div>
    );
  }

  const { account } = data;
  const isAdmin = account.role === "OWNER" || account.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {account.firstName}
            </h1>
            {isAdmin && <AdminBadge role={account.role} />}
          </div>
          <p className="text-gray-500 text-sm">
            <span className="font-medium text-gray-700">{account.tenantName}</span>
            {" · "}
            {account.email}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Workspace ID: {account.tenantSlug || account.tenantId.slice(0, 12)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveIndicator isFetching={isFetching} refreshedAt={data.refreshedAt} />
          <span className="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 hidden md:inline">
            This month
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { href: "/dashboard/conversations", label: "Conversations" },
          { href: "/dashboard/faq", label: "Manage FAQ" },
          { href: "/dashboard/billing", label: "Billing & Plans" },
          { href: "/dashboard/analytics", label: "Analytics" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
          >
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Messages Handled"
          value={data.messagesHandled.toLocaleString()}
          change="View all"
          changeType="neutral"
          icon={MessageSquare}
          iconColor="text-brand-500"
          iconBg="bg-brand-50"
          href="/dashboard/conversations"
        />
        <MetricCard
          title="Active Conversations"
          value={data.activeConversations.toLocaleString()}
          change="Open inbox"
          changeType="neutral"
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
          href="/dashboard/conversations"
        />
        <MetricCard
          title="Bookings"
          value={data.bookings.toLocaleString()}
          change="View calendar"
          changeType="neutral"
          icon={Calendar}
          iconColor="text-purple-500"
          iconBg="bg-purple-50"
          href="/dashboard/bookings"
        />
        <MetricCard
          title="Orders"
          value={data.orders.toLocaleString()}
          change="View orders"
          changeType="neutral"
          icon={ShoppingCart}
          iconColor="text-orange-500"
          iconBg="bg-orange-50"
          href="/dashboard/orders"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineChart data={data.weeklyVolume} />
        </div>
        <div>
          <UsageWidget usage={data.usage} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={data.recentActivity} />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">AI Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Auto-resolved</span>
                <span className="font-semibold text-gray-900">{data.aiResolutionRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.aiResolutionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg response time</span>
                <span className="font-semibold text-gray-900">
                  {data.avgResponseTimeMs > 0
                    ? `<${Math.round(data.avgResponseTimeMs / 1000)}s`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Human handoffs</span>
                <span className="font-semibold text-gray-900">{data.humanHandoffs}</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/billing"
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-colors"
          >
            <CreditCard className="w-5 h-5 text-brand-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">Upgrade plan</div>
              <div className="text-xs text-gray-500">Pay with Razorpay</div>
            </div>
          </Link>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Top FAQ Hits</h3>
              </div>
              <Link href="/dashboard/faq" className="text-xs text-brand-600 hover:underline flex items-center gap-0.5">
                <HelpCircle className="w-3 h-3" />
                Manage
              </Link>
            </div>
            <div className="space-y-2">
              {data.topFAQs.length ? (
                data.topFAQs.map((faq) => (
                  <div key={faq.question} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate max-w-36">{faq.question}</span>
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {faq.hits}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-500">Add FAQs to train your AI assistant</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
