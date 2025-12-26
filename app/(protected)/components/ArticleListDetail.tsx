"use client";

import Image from "next/image";

import heartEmpty from "../../assets/like_empty.svg";
import heartFull from "../../assets/like_full.svg";
import ArticleComments, { Comment } from "./ArticleComments";

export type ArticleDetail = {
  id: number;
  title: string;
  content: string;

  author: string;
  createdAt: string;
  viewCount: number;
  category: string;

  likeCount: number;
  isLiked?: boolean;

  commentCount: number;
  comments: Comment[];
  commentSLoading?: boolean;
};

type Props = {
  article: ArticleDetail;
  onBack?: () => void;

  onToggleLike?: () => void;
  onSubmitComment?: (content: string) => void;

  currentUserId: number; // ✅ 추가
  onRefreshComments?: () => Promise<void> | void; // ✅ 추가
};

export default function ArticleListDetail({
  article,
  onBack,
  onToggleLike,
  onSubmitComment,
  currentUserId,
  onRefreshComments,
}: Props) {
  const heartIcon = article.isLiked ? heartFull : heartEmpty;

  return (
    <div className="rounded-[14px] border border-gray-200 bg-white p-6">
      {/* 상단: 목록으로 */}
      <div className="mb-2">
        <button
          type="button"
          onClick={onBack}
          className="
            inline-flex items-center gap-2
            rounded-md px-2
            text-sm font-semibold text-gray-700
          "
        >
          <span className="text-3xl leading-none mb-2">‹</span>
          목록으로
        </button>
      </div>

      {/* 제목 + 좋아요 */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <input
            value={article.title}
            readOnly
            className="
              h-12 w-full rounded-[10px] border border-gray-300 px-4
              text-[15px] font-semibold text-gray-900 outline-none
            "
          />
          {/* 메타 */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500">
            <span className="text-gray-700">{article.author}</span>
            <span className="text-gray-300">|</span>
            <span>{article.createdAt}</span>
            <span className="text-gray-300">|</span>
            <span>조회 {article.viewCount}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleLike}
          className="flex items-center pt-2"
          aria-label="좋아요"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-50">
            {/* @ts-ignore */}
            <Image src={heartIcon} alt="like" width={26} height={26} />
          </span>
          <span className="font-semibold text-gray-700">
            {article.likeCount}
          </span>
        </button>
      </div>

      {/* 본문 */}
      <div className="mt-4">
        <textarea
          value={article.content}
          readOnly
          className="
            h-[420px] w-full resize-none rounded-[10px]
            border border-gray-300 p-4
            text-sm font-medium text-gray-800 outline-none
          "
        />
      </div>

      {/* 댓글 컴포넌트 분리 */}
      <ArticleComments
        commentCount={article.commentCount}
        comments={article.comments}
        isLoading={article.commentSLoading}
        currentUserId={currentUserId}
        onSubmitComment={onSubmitComment}
        onRefreshComments={onRefreshComments}
      />
    </div>
  );
}
