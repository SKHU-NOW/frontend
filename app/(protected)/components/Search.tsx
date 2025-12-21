"use client";

import Image from "next/image";
import search from "../../assets/search.svg";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export default function CommunitySearchBar({
  value,
  onChange,
  placeholder = "검색어를 입력하세요",
  className,
}: Props) {
  return (
    <div className={`relative ${className ?? "w-full"}`}>
      <Image
        src={search}
        alt="검색"
        width={18}
        height={18}
        className="absolute left-4 top-1/2 -translate-y-1/2"
        priority
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-md border border-gray-500 bg-gray-100 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] pl-11 pr-4 text-[16px] text-gray-500 font-medium outline-none
                   "
      />
    </div>
  );
}
