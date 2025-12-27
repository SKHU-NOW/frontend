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
  login: (opts?: {
    forceAccountSelect?: boolean;
    forceReauth?: boolean;
  }) => void;
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
    const me = await userService.getMe();
    setUser(me);
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const access = getAccessToken();
        if (access) {
          await refreshMe();
          return;
        }

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
    const refreshToken = getRefreshToken();

    clearTokens();
    setUser(null);

    try {
      await authService.logout(refreshToken);
    } catch {}

    router.replace("/");
  };

  const login = (opts?: {
    forceAccountSelect?: boolean;
    forceReauth?: boolean;
  }) => {
    const prompt = opts?.forceReauth
      ? "login"
      : opts?.forceAccountSelect === false
      ? "none"
      : "select_account";

    authService.startMicrosoftLogin({ prompt });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      login,
      logout,
      refreshMe,
    }),
    [isLoading, isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
