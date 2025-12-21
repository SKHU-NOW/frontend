"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setTokens } from "@/app/lib/api/fetchClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // hash 예시: #accessToken=xxx&refreshToken=yyy
    const hash = window.location.hash.replace("#", "");
    const params = new URLSearchParams(hash);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken });
      router.replace("/"); // ✅ 저장 후 홈으로
      return;
    }

    // 토큰이 없으면 로그인 페이지 or 홈으로
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-[200px] flex items-center justify-center text-gray-500">
      로그인 처리 중...
    </div>
  );
}
