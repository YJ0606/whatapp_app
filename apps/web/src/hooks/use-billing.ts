import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { unwrapApiData } from "@/lib/api-response";
import { useAuth } from "@/providers/auth-provider";
import type { BillingOverview, BillingInvoice, BillingUsageItem } from "@/types/billing";

export function useBillingOverview() {
  const { user, isAuthenticated } = useAuth();

  return useQuery<BillingOverview>({
    queryKey: ["billing", "overview", user?.tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: BillingOverview }>("/billing");
      return unwrapApiData<BillingOverview>(data);
    },
    enabled: isAuthenticated && Boolean(user?.tenantId),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useBillingInvoices() {
  const { user, isAuthenticated } = useAuth();

  return useQuery<BillingInvoice[]>({
    queryKey: ["billing", "invoices", user?.tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: BillingInvoice[] }>("/billing/invoices");
      return unwrapApiData<BillingInvoice[]>(data);
    },
    enabled: isAuthenticated && Boolean(user?.tenantId),
  });
}

export function useBillingUsage() {
  const { user, isAuthenticated } = useAuth();

  return useQuery<{ items: BillingUsageItem[]; periodStart: string; periodEnd: string | null }>({
    queryKey: ["billing", "usage", user?.tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: { items: BillingUsageItem[]; periodStart: string; periodEnd: string | null };
      }>("/billing/usage");
      return unwrapApiData(data);
    },
    enabled: isAuthenticated && Boolean(user?.tenantId),
  });
}

export function useInvalidateBilling() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["billing"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}
