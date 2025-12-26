import { api, API_BASE, getRefreshToken } from "./fetchClient";

export const authService = {
  startMicrosoftLogin: () => {
    const target =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "local"
        : "prod";

    window.location.href = `${API_BASE}/auth/login?redirect=${target}`;
  },

  /**
   */
  logout: async () => {
    const refreshToken = getRefreshToken(); // 토큰 제거 전에 확보해두면 좋음(선택)

    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      credentials: "include",
      redirect: "manual",
    });

    if (res.type === "opaqueredirect") return;

    // same-origin이면 302를 그대로 볼 수도 있음
    if (res.status >= 300 && res.status < 400) return;

    // 정상 200~299만 OK
    if (!res.ok) {
      throw new Error(`Logout failed: ${res.status}`);
    }
  },
};
