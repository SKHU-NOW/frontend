"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import commentIcon from "../../assets/icon_comment.svg";

export type Reply = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  replies?: Reply[];
};

type Props = {
  commentCount: number;
  comments: Comment[];

  onSubmitComment?: (content: string) => void;
  onSubmitReply?: (commentId: string, content: string) => void;
};

export default function ArticleComments({
  commentCount,
  comments,
  onSubmitComment,
  onSubmitReply,
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

      {/* 목록 */}
      <div className="divide-y divide-gray-200">
        {comments.map((c) => (
          <CommentRow key={c.id} comment={c} onSubmitReply={onSubmitReply} />
        ))}
      </div>

      {/* 댓글 작성 */}
      <div className="border-t border-gray-300 p-4">
        <div className="flex gap-3">
          <input
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            placeholder="댓글을 입력하세요."
            className="
              h-11 flex-1 rounded-[10px] border border-gray-300 px-4
              text-sm font-medium text-gray-800 outline-none
              focus:border-primary-500
            "
          />
          <button
            type="button"
            disabled={!canSubmitComment}
            onClick={() => {
              const v = commentDraft.trim();
              if (!v) return;
              onSubmitComment?.(v);
              setCommentDraft("");
            }}
            className="
              h-11 w-20 rounded-[10px]
              bg-primary-500 text-sm font-semibold text-white
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

/** ----------------- 댓글 1개(대댓글 포함) ----------------- */
function CommentRow({
  comment,
  onSubmitReply,
}: {
  comment: Comment;
  onSubmitReply?: (commentId: string, content: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  const canSubmitReply = replyDraft.trim().length > 0;

  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-3">
        {/* 프로필 원형(예시) */}
        <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-yellow-300" />

        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <span>{comment.author}</span>
            <span className="text-gray-300">·</span>
            <span className="font-medium text-gray-500">
              {comment.createdAt}
            </span>
          </div>

          <div className="mt-2 text-sm font-medium text-gray-800">
            {comment.content}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="text-xs font-semibold text-gray-600 hover:text-primary-600"
            >
              {replyOpen ? "답글 닫기" : "답글 달기"}
            </button>
          </div>

          {/* 대댓글 입력 */}
          {replyOpen && (
            <div className="mt-3 flex gap-3">
              <div className="mt-2 text-gray-500">↳</div>
              <div className="flex flex-1 gap-3">
                <input
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="답글을 입력하세요."
                  className="
                    h-10 flex-1 rounded-[10px] border border-gray-300 px-4
                    text-sm font-medium text-gray-800 outline-none
                    focus:border-primary-500
                  "
                />
                <button
                  type="button"
                  disabled={!canSubmitReply}
                  onClick={() => {
                    const v = replyDraft.trim();
                    if (!v) return;
                    onSubmitReply?.(comment.id, v);
                    setReplyDraft("");
                    setReplyOpen(false);
                  }}
                  className="
                    h-10 w-20 rounded-[10px]
                    bg-gray-800 text-sm font-semibold text-white
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >
                  등록
                </button>
              </div>
            </div>
          )}

          {/* 대댓글 목록 */}
          {comment.replies?.length ? (
            <div className="mt-3 space-y-2">
              {comment.replies.map((r) => (
                <div key={r.id} className="flex items-start gap-3">
                  <div className="mt-2 text-gray-500">↳</div>
                  <div className="flex items-start gap-3 rounded-[10px] border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-orange-700" />
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                        <span>{r.author}</span>
                        <span className="text-gray-300">·</span>
                        <span className="font-medium text-gray-500">
                          {r.createdAt}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-gray-800">
                        {r.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
