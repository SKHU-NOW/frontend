"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

import Field from "@/app/components/ui/Field";
import ButtonBlue from "@/app/components/ui/ButtonBlue";
import ArticleCategoryTabs from "@/app/(protected)/components/ArticleCategoryTabs";
import type { PostCategory } from "@/app/(protected)/types/article";

import uploadIcon from "../../assets/upload.svg";
import {
  articleService,
  CommunityPostCategory,
  CommunityPostDto,
} from "@/app/lib/api/article";

type Props = {
  communityId: number;
  initialCategory?: CommunityPostCategory; // ✅ ALL 제거
  onCancel: () => void;
  onCreated: (created: CommunityPostDto) => void;
};

export default function ArticleCreateForm({
  communityId,
  initialCategory = "NORMAL",
  onCancel,
  onCreated,
}: Props) {
  const [category, setCategory] =
    useState<CommunityPostCategory>(initialCategory);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ swagger가 multipartFile "단일"이라 1개만 보관
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0;
  }, [title, content]);

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = ""; // 같은 파일 다시 선택 가능하게
    if (!picked) return;

    setFile(picked);
  };

  const removeFile = () => setFile(null);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        multipartFile: file ?? null, // ✅ 여기로 File 그대로
      };

      const created = await articleService.createCommunityPost(
        communityId,
        payload
      );

      onCreated(created);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "게시글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* 상단: 카테고리 */}
      <div className="flex items-center gap-3">
        <div className="text-sm font-extrabold text-gray-800">카테고리</div>
        <ArticleCategoryTabs
          value={category}
          onChange={(v) => setCategory(v as CommunityPostCategory)}
        />
      </div>

      {/* 제목 */}
      <div className="mt-5">
        <Field
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요."
        />
      </div>

      {/* 내용 */}
      <div className="mt-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요."
          className="
            h-[520px] w-full resize-none rounded-[10px]
            border border-gray-300 p-4
            text-sm font-medium text-gray-800 outline-none
            placeholder:text-gray-400
            focus:border-primary-500
          "
        />
      </div>

      {errorMsg && (
        <div className="mt-3 text-sm font-semibold text-red-500">
          {errorMsg}
        </div>
      )}

      {/* 하단: 이미지 업로드 + 버튼 */}
      <div className="mt-6 flex items-center justify-between">
        {/* 업로드 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isSubmitting}
            className="
              inline-flex items-center gap-2 rounded-full
              border border-gray-300 bg-white px-4 py-2
              text-sm font-semibold text-gray-700
              hover:bg-gray-50
            "
          >
            이미지 업로드
            <span className="inline-flex h-7 w-7 items-center justify-center">
              <Image src={uploadIcon} alt="upload" width={23} height={23} />
            </span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPickFile}
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <ButtonBlue
            variant="secondary"
            onClick={onCancel}
            className="h-10 w-20"
            disabled={isSubmitting}
          >
            취소
          </ButtonBlue>

          <ButtonBlue
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="h-10 w-20"
          >
            {isSubmitting ? "등록중" : "등록"}
          </ButtonBlue>
        </div>
      </div>

      {/* 선택된 파일 표시 */}
      {file && (
        <div className="mt-4 rounded-[10px] border border-gray-200 p-4">
          <div className="text-sm font-extrabold text-gray-800">
            첨부된 이미지 (1)
          </div>

          <div className="mt-3 flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
            <div className="truncate text-sm font-semibold text-gray-700">
              {file.name}
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-sm font-extrabold text-red-500 hover:opacity-80"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
