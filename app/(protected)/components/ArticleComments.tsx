"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import commentIcon from "../../assets/icon_comment.svg";
import { commentService } from "@/app/lib/api/comment";
import ArticleActionMenu from "./ActionMenu";
import clickMenu from "../../assets/menu_clicked.svg";
import menu from "../../assets/icon_menu.svg";

export type Comment = {
  id: number;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
};

type Props = {
  commentCount: number;
  comments: Comment[];
  isLoading?: boolean;

  currentUserId: number; // ✅ 추가: 내 댓글 판단
  onSubmitComment?: (content: string) => void;

  // ✅ 댓글 변경 후(수정/삭제/등록) 재조회 트리거
  onRefreshComments?: () => Promise<void> | void;

  // ✅ 신고 시 필요한 post 작성자(= 신고 대상 id가 아니라 댓글 작성자 id를 넣을 거라 필수는 아님)
};

export default function ArticleComments({
  commentCount,
  comments,
  isLoading,
  currentUserId,
  onSubmitComment,
  onRefreshComments,
}: Props) {
  const [commentDraft, setCommentDraft] = useState("");

  const canSubmitComment = useMemo(
    () => commentDraft.trim().length > 0,
    [commentDraft]
  );

  return (
    <div className="mt-6 rounded-[10px] border border-gray-300 bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-0.5 border-b border-gray-300 px-4 py-3">
        <span className="inline-flex h-9 w-9 items-center justify-center">
          {/* @ts-ignore */}
          <Image src={commentIcon} alt="comment" width={40} height={40} />
        </span>
        <span className="font-semibold text-gray-700">{commentCount}</span>
      </div>

      {/* 댓글 작성(맨 위로 이동) */}
      <div className="border-b border-gray-300 p-4">
        <div className="flex gap-3">
          <input
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            placeholder="댓글을 입력하세요."
            className="h-11 flex-1 rounded-[10px] border border-gray-300 px-4 text-sm font-medium text-gray-800 outline-none focus:border-primary-500"
          />
          <button
            type="button"
            disabled={!canSubmitComment}
            onClick={async () => {
              const v = commentDraft.trim();
              if (!v) return;

              await onSubmitComment?.(v);
              setCommentDraft("");
              // onSubmitComment 내부에서 refresh를 하더라도, 안전하게 한 번 더 호출 가능
              await onRefreshComments?.();
            }}
            className="h-11 w-20 rounded-[10px] bg-primary-500 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            등록
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="divide-y divide-gray-200">
        {isLoading && (
          <div className="px-4 py-6 text-sm font-semibold text-gray-500">
            댓글 불러오는 중...
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <div className="px-4 py-6 text-sm font-semibold text-gray-500">
            아직 댓글이 없습니다.
          </div>
        )}

        {!isLoading &&
          comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onRefresh={onRefreshComments}
            />
          ))}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  currentUserId,
  onRefresh,
}: {
  comment: Comment;
  currentUserId: number;
  onRefresh?: () => Promise<void> | void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = useMemo(
    () => Number.isFinite(currentUserId) && comment.authorId === currentUserId,
    [currentUserId, comment.authorId]
  );

  const handleEditStart = () => {
    setDraft(comment.content);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setDraft(comment.content);
  };

  const handleEditSave = async () => {
    const next = draft.trim();
    if (!next) return;
    if (isSaving) return;

    try {
      setIsSaving(true);
      await commentService.updateComment(comment.id, { content: next });
      setIsEditing(false);
      await onRefresh?.();
    } catch (e: any) {
      alert(e?.message ?? "댓글 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (isDeleting) return;

    const ok = confirm("댓글을 삭제할까요?");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await commentService.deleteComment(comment.id);
      await onRefresh?.();
    } catch (e: any) {
      alert(e?.message ?? "댓글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async () => {
    if (isOwner) return;

    const reason = prompt("신고 사유를 입력하세요. (선택)");
    try {
      await commentService.reportComment(comment.id, {
        reportedUserId: comment.authorId,
        reason: reason?.trim() || undefined,
      });
      alert("신고가 접수되었습니다.");
    } catch (e: any) {
      alert(e?.message ?? "댓글 신고에 실패했습니다.");
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-3">
        {/* 프로필 원형(예시) */}
        <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-yellow-300" />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span>{comment.authorNickname}</span>
              <span className="text-gray-300">·</span>
              <span className="font-medium text-gray-500">
                {comment.createdAt}
              </span>
            </div>

            {/* 메뉴 버튼 */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                aria-label="comment menu"
              >
                <Image
                  src={menuOpen ? clickMenu : menu}
                  alt="메뉴바"
                  width={26}
                  height={26}
                />
              </button>

              <ArticleActionMenu
                isOpen={menuOpen}
                variant={isOwner ? "owner" : "other"}
                onClose={() => setMenuOpen(false)}
                onEdit={() => handleEditStart()}
                onDelete={() => handleDelete()}
                onReport={() => handleReport()}
              />
            </div>
          </div>

          {/* 내용/수정 */}
          <div className="mt-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-800 outline-none focus:border-primary-500"
                  autoFocus
                />
                <button
                  type="button"
                  disabled={!draft.trim() || isSaving}
                  onClick={handleEditSave}
                  className="h-10 rounded-md bg-primary-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSaving ? "저장중" : "저장"}
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="h-10 rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-800">
                {comment.content}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 중 표기(선택) */}
      {isDeleting && (
        <div className="mt-2 text-xs font-semibold text-gray-400">
          삭제 중...
        </div>
      )}
    </div>
  );
}
