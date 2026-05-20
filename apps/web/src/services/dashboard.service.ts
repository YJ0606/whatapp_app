import apiClient from "@/lib/api-client";
import { unwrapApiData } from "@/lib/api-response";
import type { DashboardMetrics } from "@/types/dashboard";

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data } = await apiClient.get<{ data: DashboardMetrics }>("/dashboard");
    return unwrapApiData<DashboardMetrics>(data);
  },
};
