"use client";

import Image from "next/image";
import type { PostCategory, PostCategoryFilter } from "../types/article";
import { useMemo, useState } from "react";
import CommunitySearchBar from "./Search";
import ArticleCategoryTabs from "./ArticleCategoryTabs";
import ArticleListItem from "./ArticleListItem";

/** 목록에서 필요한 최소 필드 */
export type PostSummary = {
  id: number;
  title: string;
  author: string;
  authorId: number; // ✅ 추가 (내 글/남 글 판별)
  createdAt: string;

  category: PostCategory | string;

  viewCount: number;
  likeCount: number;
  commentCount: number;

  pinned?: boolean;

  isLiked?: boolean;
};

type Props = {
  posts: PostSummary[];
  writeIcon: any;
  isLoading?: boolean;

  currentUserId: number; // ✅ 추가

  canPin: boolean; // ✅ 추가
  onTogglePin?: (id: number) => void; // ✅ 추가

  onClickWrite?: () => void;
  onClickPost?: (id: number) => void;

  onEdit?: (id: number) => void; // ✅ 추가
  onDelete?: (id: number) => void; // ✅ 추가
  onReport?: (id: number) => void; // ✅ 추가

  onToggleLike?: (id: number) => void;
};

export default function ArticleList({
  posts,
  writeIcon,
  isLoading,
  currentUserId,
  canPin,
  onTogglePin,
  onClickWrite,
  onClickPost,
  onEdit,
  onDelete,
  onReport,
  onToggleLike,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<PostCategoryFilter>("ALL");

  const q = keyword.trim();

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory = category === "ALL" ? true : p.category === category;
      const matchKeyword = !q
        ? true
        : p.title.includes(q) || p.author.includes(q);
      return matchCategory && matchKeyword;
    });
  }, [posts, category, q]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* 상단: Search + 글쓰기 버튼 */}
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <CommunitySearchBar
            value={keyword}
            onChange={(e: any) => setKeyword(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onClickWrite}
          className="shadow-[0px_0px_0px_0px_rgba(0,0,0,0.05)] transition-colors mt-1"
          aria-label="글쓰기"
        >
          <Image src={writeIcon} alt="글쓰기" width={53} height={53} />
        </button>
      </div>

      {/* 탭 */}
      <div className="mt-4">
        <ArticleCategoryTabs value={category} onChange={setCategory} showAll />
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="mt-6 text-sm font-semibold text-gray-500">
          불러오는 중...
        </div>
      )}

      {/* 리스트 */}
      {!isLoading && (
        <div className="mt-6 space-y-4">
          {filtered.map((post) => (
            <ArticleListItem
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              canPin={canPin} // ✅ 추가
              onTogglePin={(id) => onTogglePin?.(id)}
              onClick={() => onClickPost?.(post.id)}
              onEdit={(id) => onEdit?.(id)}
              onDelete={(id) => onDelete?.(id)}
              onReport={(id) => onReport?.(id)}
              onToggleLike={(id) => onToggleLike?.(id)}
            />
          ))}

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm font-semibold text-gray-500">
              게시글이 없습니다.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
