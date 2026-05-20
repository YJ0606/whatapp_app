"use client";

import type { DashboardWeeklyVolume } from "@/types/dashboard";

interface PipelineChartProps {
  data: DashboardWeeklyVolume[];
}

export function PipelineChart({ data }: PipelineChartProps) {
  const chartData = data.length
    ? data
    : [{ name: "Week 1", messages: 0, bookings: 0, orders: 0, resolved: 0, date: "" }];

  const maxMessages = Math.max(...chartData.map((d) => d.messages), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Message Volume</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span>Messages</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Bookings</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Orders</span>
          </div>
        </div>
      </div>

      {chartData.every((d) => d.messages === 0 && d.bookings === 0 && d.orders === 0) ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          No activity yet for your workspace — data will appear here as customers engage.
        </div>
      ) : (
        <div className="flex items-end gap-4 h-48">
          {chartData.map((d) => (
            <div key={d.name} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1 h-40">
                <div
                  className="flex-1 bg-brand-500 rounded-t-sm opacity-80 transition-all duration-500"
                  style={{ height: `${(d.messages / maxMessages) * 100}%` }}
                  title={`Messages: ${d.messages}`}
                />
                <div
                  className="flex-1 bg-purple-500 rounded-t-sm opacity-80 transition-all duration-500"
                  style={{ height: `${(d.bookings / maxMessages) * 100 * 8}%` }}
                  title={`Bookings: ${d.bookings}`}
                />
                <div
                  className="flex-1 bg-orange-500 rounded-t-sm opacity-80 transition-all duration-500"
                  style={{ height: `${(d.orders / maxMessages) * 100 * 8}%` }}
                  title={`Orders: ${d.orders}`}
                />
              </div>
              <span className="text-xs text-gray-400">{d.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
