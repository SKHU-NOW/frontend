"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import logo from "../../assets/community_header.svg";

export default function ProtectedHeader({
  communityId,
}: {
  communityId?: number;
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-20">
      <div className="flex h-20 items-center pl-6 ml-20">
        <Image src={logo} alt="로고" />

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
