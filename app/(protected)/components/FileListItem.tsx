"use client";

import { fileService, type CommunityResourceDto } from "@/app/lib/api/file";
import Image from "next/image";
import { useMemo, useState } from "react";
import trash from "../../assets/icon_trash.svg";

type Props = {
  item: CommunityResourceDto;
  currentUserId: number; // ✅ 추가
  onDeleted?: () => void; // ✅ 추가
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

function triggerDownload(url: string) {
  // 새 탭으로 열면 브라우저/서버 설정에 따라 바로 다운로드 or 미리보기됨
  // '다운로드 강제'가 필요하면 서버에서 Content-Disposition을 내려줘야 함.
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function FileListItem({
  item,
  currentUserId,
  onDeleted,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = useMemo(() => {
    return Number.isFinite(currentUserId) && item.uploaderId === currentUserId;
  }, [currentUserId, item.uploaderId]);

  const onDownload = async () => {
    if (!Number.isFinite(item.id)) return;

    try {
      setIsDownloading(true);

      // ✅ download API로 url 발급
      const res = await fileService.getResourceDownloadUrl(item.id);
      const url = res?.downloadUrl;

      if (url) {
        triggerDownload(url);
        return;
      }

      // 혹시 응답이 비정상이라면 fileId로 fallback
      if (item.imageUrl) triggerDownload(item.imageUrl);
      else alert("다운로드 URL을 받을 수 없습니다.");
    } catch (e: any) {
      // 실패 시에도 fileId가 있으면 fallback 시도
      if (item.imageUrl) {
        triggerDownload(item.imageUrl);
      } else {
        alert(e?.message ?? "다운로드에 실패했습니다.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const onDelete = async () => {
    if (!isOwner) return;
    if (!Number.isFinite(item.id)) return;
    if (isDeleting) return;

    const ok = confirm("이 자료를 삭제할까요?");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await fileService.deleteCommunityResource(item.id); // ✅ 삭제 API 호출
      onDeleted?.(); // ✅ 목록 재조회
    } catch (e: any) {
      alert(e?.message ?? "자료 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl border border-gray-300 bg-white pl-6 pr-5 py-4
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
          <span className="whitespace-nowrap">{item.uploaderNickname}</span>
          <span className="whitespace-nowrap">
            {formatDate(item.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="
            inline-flex h-9 items-center justify-center rounded-md
            border border-gray-300 bg-white px-4
            text-sm font-extrabold text-gray-700
            hover:bg-gray-100 disabled:opacity-60
          "
          >
            {isDownloading ? "다운로드 중..." : "Download"}
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="mb-0.5 disabled:opacity-50"
              aria-label="자료 삭제"
              title="삭제"
            >
              <Image src={trash} alt="삭제" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
