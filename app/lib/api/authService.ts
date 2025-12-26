// app/lib/api/authService.ts
import { API_BASE } from "./fetchClient";

type LoginPrompt = "select_account" | "login" | "none";

export const authService = {
  startMicrosoftLogin: (opts?: { prompt?: LoginPrompt; returnTo?: string }) => {
    const target =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "local"
        : "prod";

    const prompt = opts?.prompt ?? "select_account"; // 기본값
    const returnTo = opts?.returnTo ?? ""; // (선택) 서버가 지원하면 전달

    const url = new URL(`${API_BASE}/auth/login`);
    url.searchParams.set("redirect", target);

    // 핵심: 계정 선택/재로그인 유도
    if (prompt && prompt !== "none") url.searchParams.set("prompt", prompt);

    // (선택) 서버가 returnTo를 지원하면 붙여서 보낼 수 있음
    if (returnTo) url.searchParams.set("returnTo", returnTo);

    window.location.href = url.toString();
  },

  logout: async (refreshToken?: string | null) => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      credentials: "include",
      redirect: "manual",
    });

    if (res.type === "opaqueredirect") return;
    if (res.status >= 300 && res.status < 400) return;

    if (!res.ok) throw new Error(`Logout failed: ${res.status}`);
  },
};
