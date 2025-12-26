"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export default function ProtectedGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // ✅ 자동 로그인 X, 공개 페이지로 이동
      // 필요하면 returnTo를 query로 넘겨서, 로그인 후 다시 돌아오게 만들 수 있음
      router.replace(`/?returnTo=${encodeURIComponent(pathname)}`);
      // 또는 router.replace("/Login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-500">
        인증 확인 중...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
