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
import { useRouter } from "next/navigation";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: MyProfile | null;
  login: () => void;
  logout: () => Promise<void>;
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
  const router = useRouter();
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

  const logout = async () => {
    // ✅ 1) 먼저 클라 토큰/상태 제거 (이 순간부터 “로그아웃 상태”)
    clearTokens();
    setUser(null);

    // ✅ 2) 서버 로그아웃은 best effort (실패해도 무시)
    try {
      await authService.logout();
    } catch {}

    // ✅ 3) 홈으로 이동
    router.replace("/");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      login: () => authService.startMicrosoftLogin(),
      logout,
      refreshMe,
    }),
    [isLoading, isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
