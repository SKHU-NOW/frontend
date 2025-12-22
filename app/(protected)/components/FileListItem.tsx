// app/(protected)/components/FileListItem.tsx
"use client";

import type { CommunityResourceDto } from "@/app/lib/api/file";

type Props = {
  item: CommunityResourceDto;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yy}/${mm}/${dd} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}

export default function FileListItem({ item }: Props) {
  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl border border-gray-300 bg-white px-6 py-4
        hover:bg-gray-50 transition-colors
      "
    >
      {/* 제목 */}
      <div className="min-w-0">
        <div className="truncate text-[15px] font-extrabold text-gray-900">
          {item.title}
        </div>
      </div>

      {/* 메타 + 다운로드 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
          <span className="whitespace-nowrap">{item.uploaderId}</span>
          <span className="whitespace-nowrap">
            {formatDate(item.createdAt)}
          </span>
        </div>

        <a
          href={item.fileId}
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex h-9 items-center justify-center rounded-md
            border border-gray-300 bg-white px-4
            text-sm font-extrabold text-gray-700
            hover:bg-gray-100
          "
        >
          Download
        </a>
      </div>
    </div>
  );
}
