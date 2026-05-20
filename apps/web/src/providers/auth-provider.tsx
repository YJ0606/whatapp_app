"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMe, useLogout } from "@/hooks/use-auth";
import { getStoredUser, isAuthenticated, syncAuthCookieFromStorage } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const { data: user, isLoading: meLoading } = useMe();
  const logoutMutation = useLogout();

  useEffect(() => {
    syncAuthCookieFromStorage();
    setHydrated(true);
  }, []);

  const storedUser = hydrated ? getStoredUser() : null;
  const resolvedUser = user ?? storedUser;
  const authed = hydrated && isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user: resolvedUser,
        isLoading: !hydrated || (authed && meLoading && !resolvedUser),
        isAuthenticated: authed,
        logout: () => logoutMutation.mutate(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
