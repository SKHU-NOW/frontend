"use client";

import Image from "next/image";

import heartEmpty from "../../assets/like_empty.svg";
import heartFull from "../../assets/like_full.svg";
import ArticleComments, { Comment } from "./ArticleComments";
import { formatTimeAgo } from "@/app/lib/utils/time";

export type ArticleDetail = {
  id: number;
  title: string;
  content: string;

  author: string;
  createdAt: string;
  viewCount: number;
  category: string;
  imageUrl?: string | null;

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
  const hasImage = Boolean(
    article.imageUrl && article.imageUrl.trim().length > 0
  );

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
          <div
            className="
              text-[23px] font-semibold text-gray-900 outline-none
            "
          >
            {article.title}
          </div>
          <div className="flex justify-between items-center">
            {/* 메타 */}
            <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-500">
              <span className="text-gray-700">{article.author}</span>
              <span className="text-gray-300">|</span>
              <span>{formatTimeAgo(article.createdAt)}</span>
              <span className="text-gray-300">|</span>
              <span>조회 {article.viewCount}</span>
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
        </div>
      </div>

      {/* 본문 */}
      <div
        className="
          mt-2 w-full rounded-[10px]
          border border-gray-300 p-4
          text-sm font-medium text-gray-800
          bg-white min-h-[400px]
        "
      >
        {/* 텍스트 */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {article.content}
        </div>

        {/* 이미지: content 바로 아래 */}
        {hasImage && (
          <div className="mt-4">
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
              {/* 비율 유지용 래퍼 */}
              <div className="relative aspect-square w-full">
                <Image
                  src={article.imageUrl as string}
                  alt="게시글 이미지"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 700px"
                />
              </div>
            </div>
          </div>
        )}
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
