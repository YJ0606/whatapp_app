import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { unwrapApiData } from "@/lib/api-response";
import { setAuthSession, clearToken, setStoredUser, getStoredUser } from "@/lib/auth";
import type { LoginDto, RegisterDto, AuthTokens, AuthUser } from "@/types/auth";

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
      const user = unwrapApiData<AuthUser>(data);
      setStoredUser(user);
      return user;
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
    enabled: typeof window !== "undefined" && Boolean(localStorage.getItem("waai_access_token")),
    initialData: () => getStoredUser() ?? undefined,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const { data } = await apiClient.post<{ data: AuthTokens }>("/auth/login", dto);
      return unwrapApiData<AuthTokens>(data);
    },
    onSuccess: async (tokens) => {
      setAuthSession(tokens);
      try {
        const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
        const user = unwrapApiData<AuthUser>(data);
        setStoredUser(user);
        queryClient.setQueryData(["auth", "me"], user);
      } catch {
        // User profile loads on next navigation
      }
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: RegisterDto) => {
      const { data } = await apiClient.post<{ data: AuthTokens }>("/auth/register", dto);
      return unwrapApiData<AuthTokens>(data);
    },
    onSuccess: async (tokens) => {
      setAuthSession(tokens);
      try {
        const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
        const user = unwrapApiData<AuthUser>(data);
        setStoredUser(user);
        queryClient.setQueryData(["auth", "me"], user);
      } catch {
        // Profile optional immediately after register
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post("/auth/logout");
      } catch {
        // Clear local session even if API is unavailable
      }
    },
    onSettled: () => {
      clearToken();
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post<{ data: { message: string } }>("/auth/forgot-password", { email });
      return unwrapApiData<AuthTokens>(data);
    },
  });
}
