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
import { MyProfile, userService } from "../lib/api/userService";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: MyProfile | null;
  login: () => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
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
  const [user, setUser] = useState<MyProfile | null>(null);

  const isAuthenticated = !!user;

  const refreshMe = async () => {
    // accessToken이 유효하면 /auth/me 성공
    // 만료면 fetchClient가 401 -> refresh -> 재시도까지 알아서 함
    const me = await userService.getMe();
    setUser(me);
  };

  // 초기 진입 시: accessToken 있으면 로그인 상태로 보고,
  // 없으면 refreshToken 있으면 refresh 시도해서 복구
  useEffect(() => {
    const boot = async () => {
      try {
        const access = getAccessToken();
        if (access) {
          await refreshMe();
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
          await refreshMe();
          return;
        }

        // 3) 둘 다 없으면 비로그인
        setUser(null);
      } catch (e) {
        clearTokens();
        setUser(null);
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
      user,
      login: () => authService.startMicrosoftLogin(),
      logout: () => {
        clearTokens();
        setUser(null);
      },
      refreshMe,
    }),
    [isLoading, isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
