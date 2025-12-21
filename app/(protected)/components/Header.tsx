"use client";

import Image from "next/image";
import Link from "next/link";

import clipIcon from "../../assets/Link_icon.svg";

export default function ProtectedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex h-20 items-center">
        {/* 왼쪽: primary 정사각형 + 아이콘 */}
        <Link
          href="/"
          className="flex h-20 w-20 items-center justify-center bg-primary-500"
        >
          <Image src={clipIcon} alt="클립" width={60} height={60} priority />
        </Link>

        {/* 로고 텍스트 */}
        <div className="pl-6">
          <span className="text-3xl font-extrabold tracking-tight text-gray-900">
            SKHU Link
          </span>
        </div>

        {/* 오른쪽 메뉴 */}
        <nav className="ml-auto pr-10">
          <ul className="flex items-center gap-10 text-gray-900 font-semibold">
            <li>
              <Link
                href="/posts"
                className="hover:text-primary-600 transition-colors"
              >
                게시글
              </Link>
            </li>
            <li>
              <Link
                href="/resources"
                className="hover:text-primary-600 transition-colors"
              >
                자료실
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
