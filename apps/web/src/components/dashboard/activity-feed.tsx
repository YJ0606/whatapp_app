"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Calendar, ShoppingCart, UserCheck } from "lucide-react";
import type { DashboardActivity } from "@/types/dashboard";

const iconMap = {
  message: { icon: MessageSquare, color: "bg-brand-50 text-brand-500" },
  booking: { icon: Calendar, color: "bg-purple-50 text-purple-500" },
  order: { icon: ShoppingCart, color: "bg-orange-50 text-orange-500" },
  handoff: { icon: UserCheck, color: "bg-yellow-50 text-yellow-500" },
};

interface ActivityFeedProps {
  activities: DashboardActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          No recent activity for your account yet.
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const { icon: Icon, color } = iconMap[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
