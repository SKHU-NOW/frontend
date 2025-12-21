"use client";

import { useMemo } from "react";

import post from "../../../../assets/post.svg";
import starIcon from "../../../../assets/star_empty.svg";
import ArticleList from "../../../components/ArticleList";
import CommunityInfoCard from "../../../components/CommunityInfo";
import ScheduleCard from "../../../components/ScheduleCard";
import { Post } from "../../../types/article";

export default function CommunityDetailPage() {
  const posts: Post[] = useMemo(
    () => [
      {
        id: "1",
        title: "글 제목",
        author: "닉네임",
        commentCount: 2,
        createdAt: "등록시간",
        category: "NOTICE",
      },
      {
        id: "2",
        title: "글 제목",
        author: "닉네임",
        commentCount: 1,
        createdAt: "등록시간",
        category: "GENERAL",
      },
      {
        id: "3",
        title: "글 제목",
        author: "닉네임",
        commentCount: 7,
        createdAt: "등록시간",
        category: "QUESTION",
      },
      {
        id: "4",
        title: "글 제목",
        author: "닉네임",
        commentCount: 0,
        createdAt: "등록시간",
        category: "GENERAL",
      },
      {
        id: "5",
        title: "글 제목",
        author: "닉네임",
        commentCount: 3,
        createdAt: "등록시간",
        category: "NOTICE",
      },
    ],
    []
  );

  return (
    <div className="mx-auto py-8 pl-40 pr-30">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* 좌측: 게시글 박스(검색+탭+리스트 포함) */}
        <ArticleList
          posts={posts}
          writeIcon={post}
          onClickWrite={() => console.log("글쓰기")}
        />

        {/* 우측 카드 */}
        <aside className="space-y-6">
          <CommunityInfoCard
            title="웹개발입문"
            term="2025년 1학기"
            manager="키웅키웅"
            starIconSrc={starIcon}
          />
          <ScheduleCard />
        </aside>
      </div>
    </div>
  );
}
