import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { unwrapApiData } from "@/lib/api-response";
import { useAuth } from "@/providers/auth-provider";

export interface AnalyticsReport {
  totalMessages: number;
  monthMessages: number;
  aiResolutionRate: number;
  conversations: number;
  resolvedConversations: number;
  humanHandoffs: number;
  bookings: number;
  orders: number;
  weeklyVolume: Array<{
    day: string;
    messages: number;
    resolved: number;
    bookings: number;
    orders: number;
  }>;
  breakdown: Array<{ label: string; count: number; pct: number }>;
}

export function useAnalytics() {
  const { user, isAuthenticated } = useAuth();

  return useQuery<AnalyticsReport>({
    queryKey: ["analytics", user?.tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AnalyticsReport }>("/analytics");
      return unwrapApiData<AnalyticsReport>(data);
    },
    enabled: isAuthenticated && Boolean(user?.tenantId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
