"use client";

import { fileService, type CommunityResourceDto } from "@/app/lib/api/file";
import Image from "next/image";
import { useMemo, useState } from "react";
import trash from "../../assets/icon_trash.svg";
import ConfirmModal from "@/app/components/ui/Modal";

type Props = {
  item: CommunityResourceDto;
  currentUserId: number;
  currentUserMileage: number;
  onDeleted?: () => void;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy} / ${mm} / ${dd}`;
  } catch {
    return iso;
  }
}

function triggerDownload(url: string) {
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
  currentUserMileage,
  onDeleted,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isOwner = useMemo(() => {
    return Number.isFinite(currentUserId) && item.uploaderId === currentUserId;
  }, [currentUserId, item.uploaderId]);

  const doDownload = async () => {
    if (!Number.isFinite(item.id)) return;

    try {
      setIsDownloading(true);

      const res = await fileService.getResourceDownloadUrl(item.id);
      const url = res?.downloadUrl;

      if (url) {
        triggerDownload(url);
        return;
      }

      if (item.imageUrl) triggerDownload(item.imageUrl);
      else alert("다운로드 URL을 받을 수 없습니다.");
    } catch (e: any) {
      if (item.imageUrl) {
        triggerDownload(item.imageUrl);
      } else {
        alert(e?.message ?? "다운로드에 실패했습니다.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const onClickDownload = () => {
    if (!Number.isFinite(item.id)) return;
    if (isDownloading) return;
    setIsDownloadOpen(true);
  };

  const openDelete = () => {
    if (!isOwner) return;
    if (!Number.isFinite(item.id)) return;
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!isOwner) return;
    if (!Number.isFinite(item.id)) return;
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await fileService.deleteCommunityResource(item.id);
      setIsDeleteOpen(false);
      onDeleted?.();
    } catch (e: any) {
      alert(e?.message ?? "자료 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
          <div className="flex items-center gap-4 text-sm font-semibold text-gray-600">
            <span className="whitespace-nowrap">{item.uploaderNickname}</span>
            <span className="whitespace-nowrap">
              {formatDate(item.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClickDownload}
              disabled={isDownloading}
              className="
            inline-flex h-9 items-center justify-center rounded-md
            border border-gray-300 bg-white px-4
            text-sm font-extrabold text-gray-700
            hover:bg-gray-100 disabled:opacity-60
          "
            >
              다운로드
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={openDelete}
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

      <ConfirmModal
        isOpen={isDownloadOpen}
        message={
          <div className="space-y-1">
            <div>
              선택하신 자료를 열람하는 데 마일리지 <b>80</b> 사용됩니다.
            </div>

            <div>마일리지가 즉시 차감되며, 자료 열람이 가능합니다.</div>

            <div className="text-primary-500 font-semibold">
              (차감된 마일리지는 환불되지 않습니다)
            </div>
          </div>
        }
        messageVariant="body"
        confirmText={isDownloading ? "다운로드 중..." : "다운로드"}
        cancelText="취소"
        onCancel={() => {
          if (isDownloading) return;
          setIsDownloadOpen(false);
        }}
        onConfirm={async () => {
          if (isDownloading) return;

          if (!Number.isFinite(currentUserMileage) || currentUserMileage < 80) {
            alert("마일리지가 부족하여 다운로드할 수 없습니다.");
            return;
          }

          setIsDownloadOpen(false);
          await doDownload();
        }}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        message="이 자료를 삭제할까요?"
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        cancelText="취소"
        confirmVariant="danger"
        onCancel={() => {
          if (isDeleting) return;
          setIsDeleteOpen(false);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
