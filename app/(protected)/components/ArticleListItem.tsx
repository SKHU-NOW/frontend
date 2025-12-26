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
import likeEmpty from "../../assets/like_empty.svg";
import likeFull from "../../assets/like_full.svg";
import { PostSummary } from "./ArticleList";

type Props = {
  post: PostSummary;
  currentUserId: number; // ✅ 추가: 내 글/남 글 판단용
  canPin: boolean; // ✅ 추가
  onTogglePin?: (postId: number) => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onReport?: (postId: number) => void; // ✅ 남 글일 때
  onClick?: () => void;
  onToggleLike?: (postId: number) => void;
};

export default function ArticleListItem({
  post,
  currentUserId,
  canPin,
  onTogglePin,
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

    // ✅ 생성자 아니면: 아예 고정 불가(우클릭 메뉴도 안 뜸)
    if (!canPin) return;

    const ok = window.confirm(
      isPinned ? "게시글 고정을 해제할까요?" : "게시글을 고정할까요?"
    );
    if (!ok) return;

    onTogglePin?.(post.id);
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={clsx(
        "relative flex items-center justify-between rounded-md border px-5 py-1.5 cursor-pointer transition-colors",
        // ✅ pinned일 때: 빨간 테두리 + #FFF3EE 배경
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
          {post.author} {post.createdAt}
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
