export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://skhu-link.duckdns.org";

/** ---- Token storage (body 기반이므로 localStorage 사용) ---- */
const ACCESS_KEY = "skhu_link_access";
const REFRESH_KEY = "skhu_link_refresh";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(tokens: Tokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}
export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/** ---- Refresh single-flight(동시 401 방지) ---- */
let refreshPromise: Promise<Tokens> | null = null;

async function refreshTokens(): Promise<Tokens> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refreshToken");

  // 서버 스펙: POST /auth/refresh { refreshToken }
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // refresh는 accessToken 없이도 동작하는 설계가 흔함 (서버 정책에 따라 다름)
    body: JSON.stringify({ refreshToken }),
    credentials: "include", // 혹시 서버가 세션/쿠키도 섞어쓴다면 안전
  });

  // 서버가 302 리다이렉트로 로그인으로 보내는 경우도 있어서 처리:
  if (res.redirected) {
    throw new Error("Refresh redirected to login");
  }

  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`);
  }

  const json = (await res.json()) as ApiEnvelope<Tokens>;
  if (!json?.success || !json.data?.accessToken || !json.data?.refreshToken) {
    throw new Error("Invalid refresh response");
  }

  setTokens(json.data);
  return json.data;
}

async function getOrRefreshTokens(): Promise<Tokens> {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** ---- core request ---- */
type RequestOptions = Omit<RequestInit, "body"> & {
  body?: any;
  auth?: boolean; // default true
};

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;

  const accessToken = auth ? getAccessToken() : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers ?? {}),
    },
    body:
      body == null
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
    credentials: "include",
  });

  // 302(리다이렉트)로 로그인 보내는 서버라면, fetch는 redirected로 표시될 수 있음
  if (res.redirected) {
    // 여기서는 "인증 필요"로 간주
    throw new Error("Redirected (likely unauthenticated)");
  }

  // accessToken 만료 → 401이면 refresh 후 재시도
  if (res.status === 401 && auth) {
    try {
      await getOrRefreshTokens();
      // 새 accessToken으로 재시도
      const retryAccess = getAccessToken();
      const retry = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers: {
          ...(body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...(retryAccess ? { Authorization: `Bearer ${retryAccess}` } : {}),
          ...(headers ?? {}),
        },
        body:
          body == null
            ? undefined
            : body instanceof FormData
            ? body
            : JSON.stringify(body),
        credentials: "include",
      });

      if (retry.redirected) throw new Error("Retry redirected");
      if (!retry.ok) {
        const text = await retry.text().catch(() => "");
        throw new Error(`Retry failed: ${retry.status} ${text}`);
      }

      const json = (await retry.json()) as ApiEnvelope<T>;
      if (!json.success) throw new Error(json.message ?? "API failed");
      return json.data;
    } catch (e) {
      // refresh 실패 → 토큰 정리
      clearTokens();
      throw e;
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  // 서버가 항상 {success,data,message} 형태라고 가정
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.success) {
    throw new Error(json.message ?? "API failed");
  }
  return json.data;
}

/** ---- public helpers ---- */
export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
