"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";

import commentIcon from "../../assets/icon_comment.svg";
import { commentService } from "@/app/lib/api/comment";
import ArticleActionMenu from "./ActionMenu";
import clickMenu from "../../assets/menu_clicked.svg";
import menu from "../../assets/icon_menu.svg";
import { formatTimeAgo } from "@/app/lib/utils/time";

import ConfirmModal from "@/app/components/ui/Modal";
import TextModal from "@/app/components/ui/TextModal";

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

  currentUserId: number;
  onSubmitComment?: (content: string) => void;
  onRefreshComments?: () => Promise<void> | void;
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

  const [reportTarget, setReportTarget] = useState<{
    commentId: number;
    reportedUserId: number;
    authorNickname: string;
  } | null>(null);

  const [reportReason, setReportReason] = useState("");
  const [isReportTextOpen, setIsReportTextOpen] = useState(false);
  const [isReportConfirmOpen, setIsReportConfirmOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const openReportForComment = useCallback(
    (c: Comment) => {
      // 내 댓글은 신고 불가
      if (c.authorId === currentUserId) return;

      setReportTarget({
        commentId: c.id,
        reportedUserId: c.authorId,
        authorNickname: c.authorNickname,
      });
      setReportReason("");
      setIsReportTextOpen(true);
    },
    [currentUserId]
  );

  const submitReport = useCallback(async () => {
    if (!reportTarget) return;
    if (isReporting) return;

    try {
      setIsReporting(true);

      await commentService.reportComment(reportTarget.commentId, {
        reportedUserId: reportTarget.reportedUserId,
        reason: reportReason.trim() || undefined,
      });

      alert("신고가 접수되었습니다.");

      // 닫기/초기화
      setIsReportConfirmOpen(false);
      setIsReportTextOpen(false);
      setReportTarget(null);
      setReportReason("");
    } catch (e: any) {
      alert(e?.message ?? "댓글 신고에 실패했습니다.");
    } finally {
      setIsReporting(false);
    }
  }, [reportTarget, reportReason, isReporting]);

  const [deleteTarget, setDeleteTarget] = useState<{
    commentId: number;
    authorNickname: string;
  } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteConfirmForComment = useCallback(
    (c: Comment) => {
      // 내 댓글만 삭제 가능
      if (c.authorId !== currentUserId) return;

      setDeleteTarget({ commentId: c.id, authorNickname: c.authorNickname });
      setIsDeleteConfirmOpen(true);
    },
    [currentUserId]
  );

  const submitDeleteComment = useCallback(async () => {
    if (!deleteTarget) return;
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await commentService.deleteComment(deleteTarget.commentId);
      await onRefreshComments?.();

      setIsDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (e: any) {
      alert(e?.message ?? "댓글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDeleting, onRefreshComments]);

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

      {/* 댓글 작성 */}
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
              onReport={() => openReportForComment(c)}
              onRequestDelete={() => openDeleteConfirmForComment(c)}
            />
          ))}
      </div>

      <TextModal
        isOpen={isReportTextOpen}
        title="댓글 신고 사유를 입력하세요"
        placeholder="예) 욕설/비방, 불법 광고, 도배 등"
        helperText={
          reportTarget
            ? `${reportTarget.authorNickname}님의 댓글을 신고합니다.`
            : undefined
        }
        confirmText="다음"
        cancelText="취소"
        initialValue={reportReason}
        onCancel={() => {
          if (isReporting) return;
          setIsReportTextOpen(false);
          setReportTarget(null);
          setReportReason("");
        }}
        onConfirm={(value) => {
          setReportReason(value);
          setIsReportTextOpen(false);
          setIsReportConfirmOpen(true);
        }}
      />

      <ConfirmModal
        isOpen={isReportConfirmOpen}
        message="댓글을 신고하시겠습니까?"
        confirmText={isReporting ? "신고 중..." : "신고"}
        cancelText="취소"
        confirmVariant="danger"
        onCancel={() => {
          if (isReporting) return;
          setIsReportConfirmOpen(false);

          setIsReportTextOpen(true);
        }}
        onConfirm={submitReport}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        message={
          deleteTarget ? `해당 댓글을 삭제할까요?` : "댓글을 삭제할까요?"
        }
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        cancelText="취소"
        confirmVariant="danger"
        onCancel={() => {
          if (isDeleting) return;
          setIsDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={submitDeleteComment}
      />
    </div>
  );
}

function CommentRow({
  comment,
  currentUserId,
  onRefresh,
  onReport,
  onRequestDelete,
}: {
  comment: Comment;
  currentUserId: number;
  onRefresh?: () => Promise<void> | void;
  onReport?: () => void;
  onRequestDelete?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span>{comment.authorNickname}</span>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-500">
                {formatTimeAgo(comment.createdAt)}
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
                onDelete={() => {
                  setMenuOpen(false);
                  onRequestDelete?.();
                }}
                onReport={() => {
                  setMenuOpen(false);
                  onReport?.();
                }}
              />
            </div>
          </div>

          {/* 내용/수정 */}
          <div>
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
    </div>
  );
}
