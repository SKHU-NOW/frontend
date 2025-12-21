"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { authService } from "../../lib/api/authService";

export default function ProtectedGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // 필요하면 returnTo를 pathname으로 전달(서버 지원 시)
      authService.startMicrosoftLogin(/* pathname */);
    }
  }, [isLoading, isAuthenticated, pathname]);

  // 로딩 중이거나 리다이렉트 직전이면 빈 화면/로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-500">
        인증 확인 중...
      </div>
    );
  }

  // 로그인 안 된 경우는 곧 로그인으로 이동될 것이므로 렌더 막기
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
