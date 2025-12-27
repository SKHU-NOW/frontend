"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import Field from "@/app/components/ui/Field";
import ButtonBlue from "@/app/components/ui/ButtonBlue";
import ArticleCategoryTabs from "@/app/(protected)/components/ArticleCategoryTabs";

import uploadIcon from "../../assets/upload.svg";
import {
  articleService,
  CommunityPostCategory,
  CommunityPostDto,
} from "@/app/lib/api/article";

type Props = {
  communityId: number;

  mode: "create" | "edit";
  postId?: number;

  initialCategory?: CommunityPostCategory;
  onCancel: () => void;

  onSaved: (saved: CommunityPostDto) => void;
};

export default function ArticleCreateForm({
  communityId,
  mode,
  postId,
  initialCategory = "NORMAL",
  onCancel,
  onSaved,
}: Props) {
  const [category, setCategory] =
    useState<CommunityPostCategory>(initialCategory);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!Number.isFinite(communityId)) return;
    if (!Number.isFinite(postId)) return;

    let alive = true;

    (async () => {
      setIsLoadingInitial(true);
      setErrorMsg(null);

      try {
        const data = await articleService.getCommunityPostById(
          communityId,
          Number(postId)
        );
        if (!alive) return;

        setCategory((data.category as CommunityPostCategory) || "NORMAL");
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setExistingImageUrl(data.imageUrl ?? null);
        setFile(null);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "게시글 정보를 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setIsLoadingInitial(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [mode, communityId, postId]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0;
  }, [title, content]);

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!picked) return;

    setFile(picked);
  };

  const removeFile = () => setFile(null);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    if (!Number.isFinite(communityId)) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        multipartFile: file ?? null,
      };

      const saved =
        mode === "create"
          ? await articleService.createCommunityPost(communityId, payload)
          : await articleService.updateCommunityPost(
              communityId,
              Number(postId),
              payload
            );

      onSaved(saved);
    } catch (err: any) {
      setErrorMsg(
        err?.message ??
          (mode === "create"
            ? "게시글 등록에 실패했습니다."
            : "게시글 수정에 실패했습니다.")
      );
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

      {isLoadingInitial && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600">
          게시글 정보를 불러오는 중...
        </div>
      )}

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
            disabled={!canSubmit || isSubmitting || isLoadingInitial}
            className="h-10 w-20"
          >
            {isSubmitting
              ? mode === "create"
                ? "등록중"
                : "수정중"
              : mode === "create"
              ? "등록"
              : "수정"}
          </ButtonBlue>
        </div>
      </div>

      {/* 기존 이미지 안내(편의) */}
      {mode === "edit" && existingImageUrl && !file && (
        <div className="mt-4 rounded-[10px] border border-gray-200 p-4">
          <div className="text-sm font-extrabold text-gray-800">
            기존 이미지
          </div>
          <div className="mt-2 text-sm font-semibold text-gray-700">
            기존 이미지가 있습니다. (새 파일을 선택하면 교체됩니다)
          </div>
        </div>
      )}

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
