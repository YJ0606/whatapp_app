import apiClient from "@/lib/api-client";
import { unwrapApiData } from "@/lib/api-response";
import { setAuthSession } from "@/lib/auth";
import type { LoginDto, RegisterDto, AuthTokens, AuthUser } from "@/types/auth";

export const authService = {
  async login(dto: LoginDto): Promise<AuthTokens> {
    const { data } = await apiClient.post<{ data: AuthTokens }>("/auth/login", dto);
    const tokens = unwrapApiData<AuthTokens>(data);
    setAuthSession(tokens);
    return tokens;
  },
  async register(dto: RegisterDto): Promise<AuthTokens> {
    const { data } = await apiClient.post<{ data: AuthTokens }>("/auth/register", dto);
    const tokens = unwrapApiData<AuthTokens>(data);
    setAuthSession(tokens);
    return tokens;
  },
  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
    return unwrapApiData<AuthUser>(data);
  },
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, password });
  },
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<{ data: AuthTokens }>("/auth/refresh", { refreshToken });
    const tokens = unwrapApiData<AuthTokens>(data);
    setAuthSession(tokens);
    return tokens;
  },
};
