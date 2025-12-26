"use client";

import Image from "next/image";
import starEmpty from "../../assets/star_empty.svg";
import starFull from "../../assets/star_full.svg";

export type Community = {
  id: string;
  title: string; // 예: "영어단어외2:알맹이와 껍데기 / 2025 - 2학기 / 전공선택"
  isStarred?: boolean;
};

type Props = {
  community: Community;
  starIconSrc?: any; // 비활성/활성 나중에 분기 가능
  onClick?: () => void;
  onToggleStar?: () => void;
};

export default function CommunityCard({
  community,
  onClick,
  onToggleStar,
}: Props) {
  const icon = community.isStarred ? starFull : starEmpty;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between rounded-md border border-gray-500 bg-white
                 pl-4 pr-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <p className="text-[15px] font-semibold text-gray-900">
        {community.title}
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar?.();
        }}
        className="flex h-9 w-9 items-center justify-center rounded-md"
        aria-label="즐겨찾기"
      >
        <Image src={icon} alt="즐겨찾기" width={18} height={18} />
      </button>
    </div>
  );
}
