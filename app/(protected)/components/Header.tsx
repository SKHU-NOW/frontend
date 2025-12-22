// app/(protected)/components/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import clipIcon from "../../assets/Link_icon.svg";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function ProtectedHeader({
  communityId,
}: {
  communityId?: number; // ✅ optional로 바꿈
}) {
  const pathname = usePathname();

  const isCommunityList = pathname === "/Community";
  const hasCommunityId = !!communityId;

  const articleHref = hasCommunityId ? `/Community/${communityId}/Article` : "";
  const fileHref = hasCommunityId ? `/Community/${communityId}/File` : "";

  const isArticle = hasCommunityId && pathname === articleHref;
  const isFile = hasCommunityId && pathname === fileHref;

  const base = "transition-colors pb-1";
  const active = "text-primary-600";
  const inactive = "text-gray-900 hover:text-primary-600";

  const showTabs = !isCommunityList && hasCommunityId;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex h-20 items-center">
        <Link
          href="/"
          className="flex h-20 w-20 items-center justify-center bg-primary-500"
        >
          <Image src={clipIcon} alt="클립" width={60} height={60} priority />
        </Link>

        <div className="pl-6">
          <span className="text-3xl font-extrabold tracking-tight text-gray-900">
            SKHU Link
          </span>
        </div>

        {showTabs && (
          <nav className="ml-auto pr-10">
            <ul className="flex items-center gap-10 text-gray-900 font-semibold">
              <li>
                <Link
                  href={articleHref}
                  className={clsx(base, isArticle ? active : inactive)}
                >
                  게시글
                </Link>
              </li>
              <li>
                <Link
                  href={fileHref}
                  className={clsx(base, isFile ? active : inactive)}
                >
                  자료실
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
