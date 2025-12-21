"use client";

import Image from "next/image";
import type { Post, PostCategory } from "../types/article";
import { useState } from "react";
import CommunitySearchBar from "./Search";
import ArticleCategoryTabs from "./ArticleCategoryTabs";
import ArticleListItem from "./ArticleListItem";

type Props = {
  posts: Post[];
  writeIcon: any;
  onClickWrite?: () => void;
};

export default function ArticleList({ posts, writeIcon, onClickWrite }: Props) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<PostCategory>("ALL");

  const q = keyword.trim();

  const filtered = posts.filter((p) => {
    const matchCategory = category === "ALL" ? true : p.category === category;
    const matchKeyword = !q
      ? true
      : p.title.includes(q) || p.author.includes(q);
    return matchCategory && matchKeyword;
  });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* 상단: Search + 글쓰기 버튼 */}
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <CommunitySearchBar value={keyword} onChange={setKeyword} />
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
        <ArticleCategoryTabs value={category} onChange={setCategory} />
      </div>

      {/* 리스트 */}
      <div className="mt-6 space-y-4">
        {filtered.map((post) => (
          <ArticleListItem key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
