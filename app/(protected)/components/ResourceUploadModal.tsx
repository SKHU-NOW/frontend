"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { title: string; file: File }) => Promise<void>;
};

export default function ResourceUploadModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !!file && !isUploading;
  }, [title, file, isUploading]);

  if (!open) return null;

  const pickFile = () => fileRef.current?.click();

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (!canSubmit) return;

    try {
      setIsUploading(true);
      await onSubmit({ title: title.trim(), file });
      // 성공 시: 닫기 + 상태 초기화
      setTitle("");
      setFile(null);
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setTitle("");
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-1000">
      {/* overlay (그림자 + 모자이크) */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[6px]"
        aria-label="닫기"
      />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[720px] max-w-[calc(100vw-40px)] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-[18px] border border-gray-300 bg-white px-10 py-10 shadow-xl">
          <div className="text-center text-2xl font-extrabold text-gray-900">
            자료 업로드
          </div>

          <div className="mt-8 space-y-4">
            {/* 제목 */}
            <div>
              <div className="mb-2 text-sm font-extrabold text-gray-700">
                제목
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="자료 제목을 입력하세요."
                className="h-12 w-full rounded-[10px] border border-gray-300 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-primary-500"
                disabled={isUploading}
              />
            </div>

            {/* 파일 */}
            <div>
              <div className="mb-2 text-sm font-extrabold text-gray-700">
                파일 선택
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={pickFile}
                  disabled={isUploading}
                  className="h-12 rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-extrabold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  파일 고르기
                </button>

                <div className="flex-1 truncate rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                  {file ? file.name : "선택된 파일 없음"}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={onPick}
                />
              </div>
            </div>
          </div>

          {/* buttons */}
          <div className="mt-10 flex gap-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="h-14 flex-1 rounded-xl bg-secondary-400 text-lg font-extrabold text-white hover:bg-secondary-500 disabled:opacity-60"
            >
              {isUploading ? "업로드 중..." : "업로드"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="h-14 flex-1 rounded-xl border border-secondary-400 bg-white text-lg font-extrabold text-secondary-500 hover:bg-secondary-50 disabled:opacity-60"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
