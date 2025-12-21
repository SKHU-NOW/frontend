// 상단 헤더는 여기서, 인증용 왼쪽 사이드 헤더는 여기서 조건 처리 -> 컴포 자체는 protected에서
"use client";
import Image from "next/image";
import Link from "next/link";
import skhu from "../../assets/SKHU Link.svg";
import community from "../../assets/icon_community.svg";
import { useAuth } from "@/app/providers/AuthProvider";
import Button from "../ui/Button";

export default function Header() {
  const { isAuthenticated, isLoading, login } = useAuth();

  return (
    <header className="sticky top-0 z-50 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] bg-white">
      <div className="flex h-[100px] items-center justify-between pl-7 pr-13">
        {/* 로고 텍스트 */}
        <Link href="/">
          <Image src={skhu} alt="skhu-link" />
        </Link>

        {/* 오른쪽 영역 */}
        {isLoading ? null : isAuthenticated ? (
          <Link href="/Community">
            <Image src={community} alt="community" width={50} height={50} />
          </Link>
        ) : (
          <Button
            title="로그인"
            variant="primary"
            className="w-28 h-10"
            onClick={login}
          />
        )}
      </div>
    </header>
  );
}
