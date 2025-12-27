import { API_BASE } from "./fetchClient";

type LoginPrompt = "select_account" | "login" | "none";

export const authService = {
  startMicrosoftLogin: (opts?: { prompt?: LoginPrompt; returnTo?: string }) => {
    const target =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "local"
        : "prod";

    const prompt = opts?.prompt ?? "select_account"; // 기본값
    const returnTo = opts?.returnTo ?? "";

    const url = new URL(`${API_BASE}/auth/login`);
    url.searchParams.set("redirect", target);

    if (prompt && prompt !== "none") url.searchParams.set("prompt", prompt);

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
