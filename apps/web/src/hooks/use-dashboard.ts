import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { unwrapApiData } from "@/lib/api-response";
import { useAuth } from "@/providers/auth-provider";
import type { DashboardMetrics } from "@/types/dashboard";

const LIVE_REFETCH_MS = 30_000;

export function useDashboard() {
  const { user, isAuthenticated } = useAuth();

  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard", user?.tenantId, user?.id, user?.email],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: DashboardMetrics }>("/dashboard");
      return unwrapApiData<DashboardMetrics>(data);
    },
    enabled: isAuthenticated && Boolean(user?.tenantId),
    staleTime: 10_000,
    refetchInterval: LIVE_REFETCH_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
}
