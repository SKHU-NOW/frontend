"use client";

import clsx from "clsx";
import type { Post, PostCategory } from "../types/article";
import { categoryStyle } from "../types/article";
import Image from "next/image";
import menu from "../../assets/icon_menu.svg";
import { useState } from "react";
import ArticleActionMenu from "./ActionMenu";
import clickMenu from "../../assets/menu_clicked.svg";
import comment from "../../assets/icon_comment.svg";
import like from "../../assets/like_empty.svg";
import { PostSummary } from "./ArticleList";

type Props = {
  post: PostSummary;
  variant?: "owner" | "other";
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onClick?: () => void;
};

export default function ArticleListItem({
  post,
  variant = "owner",
  onEdit,
  onDelete,
  onClick,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const key = (post.category ?? "ALL") as PostCategory;
  const st = categoryStyle[key] ?? categoryStyle.ALL;

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-between rounded-md border border-gray-300 bg-white px-5 py-1.5
                 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      {/* 왼쪽 컬러 바 */}
      <div
        className={clsx(
          "absolute left-0 top-0 h-full w-4 rounded-l-md",
          st.barBg
        )}
      />

      <div className="pl-2">
        <p className="text-base font-extrabold text-gray-900">{post.title}</p>
        <p className="text-sm text-gray-600">
          {post.author} {post.createdAt}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="flex items-center gap-1">
          <Image src={comment} alt="댓글" />
          <span className="text-sm font-semibold text-gray-700">
            {post.commentCount}
          </span>
        </button>

        <button type="button" className="flex items-center gap-1">
          <Image src={like} alt="좋아요" />
          <span className="text-sm font-semibold text-gray-700">
            {post.likeCount}
          </span>
        </button>

        {/* 오른쪽 ... 버튼 자리(지금은 UI만) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭 이동과 분리
            setMenuOpen((v) => !v);
          }}
          className=""
        >
          <Image
            src={menuOpen ? clickMenu : menu}
            alt="메뉴바"
            width={30}
            height={30}
          />
        </button>
      </div>

      {/* 메뉴 팝업 */}
      <ArticleActionMenu
        isOpen={menuOpen}
        variant={variant}
        onClose={() => setMenuOpen(false)}
        onEdit={() => onEdit?.(post.id)}
        onDelete={() => onDelete?.(post.id)}
      />
    </div>
  );
}
