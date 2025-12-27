"use client";

import clsx from "clsx";
import type { PostCategory } from "../types/article";
import { categoryStyle } from "../types/article";
import Image from "next/image";
import menu from "../../assets/icon_menu.svg";
import { useState } from "react";
import ArticleActionMenu from "./ActionMenu";
import clickMenu from "../../assets/menu_clicked.svg";
import comment from "../../assets/icon_comment.svg";
import likeEmpty from "../../assets/like_empty.svg";
import likeFull from "../../assets/like_full.svg";
import { PostSummary } from "./ArticleList";
import { formatTimeAgo } from "@/app/lib/utils/time";

type Props = {
  post: PostSummary;
  currentUserId: number;
  canPin: boolean;
  onRequestTogglePin?: () => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onClick?: () => void;
  onToggleLike?: (postId: number) => void;
};

export default function ArticleListItem({
  post,
  currentUserId,
  canPin,
  onRequestTogglePin,
  onEdit,
  onDelete,
  onReport,
  onClick,
  onToggleLike,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const key = (post.category ?? "ALL") as PostCategory;
  const st = categoryStyle[key] ?? categoryStyle.ALL;

  const isOwner = post.authorId === currentUserId;

  const heartIcon = post.isLiked ? likeFull : likeEmpty;

  const isPinned = !!post.pinned;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!canPin) return;

    onRequestTogglePin?.();
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={clsx(
        "relative flex items-center justify-between rounded-md border px-5 py-1.5 cursor-pointer transition-colors",
        isPinned
          ? "border-red-400 border-2 bg-[#FFF3EE] hover:bg-[#FFE9E0]"
          : "border-gray-300 bg-white hover:bg-gray-50"
      )}
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
          {post.author} <span className="text-gray-300 px-1">|</span>{" "}
          {formatTimeAgo(post.createdAt)}
        </p>
      </div>

      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="flex items-center gap-1">
          <Image src={comment} alt="댓글" />
          <span className="text-sm font-semibold text-gray-700">
            {post.commentCount}
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1"
          onClick={() => onToggleLike?.(post.id)}
        >
          <Image src={heartIcon} alt="좋아요" />
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
        variant={isOwner ? "owner" : "other"}
        onClose={() => setMenuOpen(false)}
        onEdit={() => onEdit?.(post.id)}
        onDelete={() => onDelete?.(post.id)}
        onReport={() => onReport?.(post.id)}
      />
    </div>
  );
}
