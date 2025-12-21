// app/providers/AuthProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../lib/api/authService";
import { getAccessToken, getRefreshToken } from "../lib/api/fetchClient";

import { api, setTokens, clearTokens } from "../lib/api/fetchClient";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 초기 진입 시: accessToken 있으면 로그인 상태로 보고,
  // 없으면 refreshToken 있으면 refresh 시도해서 복구
  useEffect(() => {
    const boot = async () => {
      try {
        const access = getAccessToken();
        if (access) {
          setIsAuthenticated(true);
          return;
        }

        // 2) refreshToken 있으면 refresh 시도
        const refresh = getRefreshToken();
        if (refresh) {
          const tokens = await api.post<{
            accessToken: string;
            refreshToken: string;
          }>("/auth/refresh", { refreshToken: refresh }, { auth: false });
          setTokens(tokens);
          setIsAuthenticated(true);
          return;
        }

        // 3) 둘 다 없으면 비로그인
        setIsAuthenticated(false);
      } catch {
        clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    boot();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated,
      login: () => authService.startMicrosoftLogin(),
    }),
    [isLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
