"use client";

import { useMemo, useState } from "react";
import { fileService, type CommunityResourceDto } from "@/app/lib/api/file";
import FileListItem from "./FileListItem";
import CommunitySearchBar from "./Search";
import ResourceUploadModal from "./ResourceUploadModal";

type Props = {
  communityId: number; // ✅ 추가
  items: CommunityResourceDto[];
  isLoading?: boolean;
  errorMsg?: string | null;
  onRetry?: () => void;

  onUploaded?: () => void; // ✅ 업로드 후 목록 재조회 용도
};

export default function FileList({
  communityId,
  items,
  isLoading,
  errorMsg,
  onRetry,
  onUploaded,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = keyword.trim();
    if (!q) return items;
    return items.filter((it) => it.title.includes(q));
  }, [items, keyword]);

  const handleUpload = async (payload: { title: string; file: File }) => {
    try {
      setUploadError(null);
      await fileService.createCommunityResource(communityId, {
        title: payload.title,
        multipartFile: payload.file,
      });
      onUploaded?.(); // ✅ 목록 재조회
    } catch (e: any) {
      setUploadError(e?.message ?? "자료 업로드에 실패했습니다.");
      throw e;
    }
  };

  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-8 shadow-sm">
      {/* 검색 + 업로드 버튼 */}
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1">
          <CommunitySearchBar
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="h-[46px] rounded-[10px] bg-secondary-400 px-5 text-sm font-extrabold text-white hover:bg-secondary-500 transition-colors"
        >
          자료 업로드
        </button>
      </div>

      {/* 에러 */}
      {errorMsg && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {errorMsg}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-3 underline underline-offset-2"
            >
              다시 시도
            </button>
          )}
        </div>
      )}

      {/* 로딩 */}
      {isLoading && (
        <div className="mt-6 text-sm font-semibold text-gray-500">
          불러오는 중...
        </div>
      )}

      {/* 리스트 */}
      <div className="mt-6 space-y-4">
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm font-semibold text-gray-500">
            자료가 없습니다.
          </div>
        )}

        {filtered.map((item) => (
          <FileListItem key={item.id} item={item} />
        ))}
      </div>

      {/* 업로드 작성 폼 모달 */}
      <ResourceUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
      />
    </div>
  );
}
