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

function isEnvelope<T>(v: any): v is ApiEnvelope<T> {
  return (
    v &&
    typeof v === "object" &&
    typeof (v as any).success === "boolean" &&
    "data" in v
  );
}

async function parseJsonSafe(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // 혹시 JSON 아닌 문자열일 수도 있어서
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;

  const accessToken = auth ? getAccessToken() : null;

  const doFetch = async (token?: string | null) => {
    return fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  };

  const res = await doFetch(accessToken);

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
      const retry = await doFetch(retryAccess);

      if (retry.redirected) throw new Error("Retry redirected");
      if (!retry.ok) {
        const errBody = await parseJsonSafe(retry);
        throw new Error(
          typeof errBody === "string"
            ? `HTTP ${retry.status}: ${errBody}`
            : `HTTP ${retry.status}: ${JSON.stringify(errBody)}`
        );
      }

      const parsed = await parseJsonSafe(retry);
      if (isEnvelope<T>(parsed)) {
        if (!parsed.success) throw new Error(parsed.message ?? "API failed");
        return parsed.data;
      }
      return parsed as T; // raw 응답 지원
    } catch (e) {
      clearTokens();
      throw e;
    }
  }

  if (!res.ok) {
    const errBody = await parseJsonSafe(res);
    throw new Error(
      typeof errBody === "string"
        ? `HTTP ${res.status}: ${errBody}`
        : `HTTP ${res.status}: ${JSON.stringify(errBody)}`
    );
  }

  const parsed = await parseJsonSafe(res);

  // Envelope면 data 반환 / 아니면 raw 그대로 반환
  if (isEnvelope<T>(parsed)) {
    if (!parsed.success) throw new Error(parsed.message ?? "API failed");
    return parsed.data;
  }
  return parsed as T;
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
