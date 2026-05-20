"use client";

import { formatDistanceToNow } from "date-fns";

interface LiveIndicatorProps {
  isFetching: boolean;
  refreshedAt?: string;
}

export function LiveIndicator({ isFetching, refreshedAt }: LiveIndicatorProps) {
  const label = refreshedAt
    ? `Updated ${formatDistanceToNow(new Date(refreshedAt), { addSuffix: true })}`
    : "Connecting…";

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isFetching ? "animate-ping bg-brand-400" : "bg-brand-500"
          }`}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
      </span>
      <span className="font-medium text-brand-700">Live</span>
      <span className="text-gray-400 hidden sm:inline">·</span>
      <span className="text-xs text-gray-500 hidden sm:inline">{label}</span>
    </div>
  );
}
