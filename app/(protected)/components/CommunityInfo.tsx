"use client";

import Image from "next/image";

type Props = {
  title: string;
  term: string;
  manager: string;
  starIconSrc: any;
};

export default function CommunityInfoCard({
  title,
  term,
  manager,
  starIconSrc,
}: Props) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <button
        type="button"
        className="absolute right-4 top-4 h-10 w-10 rounded-md hover:bg-gray-50 flex items-center justify-center"
        aria-label="즐겨찾기"
      >
        <Image src={starIconSrc} alt="즐겨찾기" width={22} height={22} />
      </button>

      <div className="text-center">
        <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
        <div className="mt-6 space-y-2 text-sm font-semibold text-gray-800">
          <p>학기: {term}</p>
          <p>관리자: {manager}</p>
        </div>

        <button
          type="button"
          className="mt-8 h-11 w-28 rounded-md bg-secondary-400 text-white font-semibold hover:bg-secondary-500 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
