"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ArticleList, {
  PostSummary,
} from "@/app/(protected)/components/ArticleList";
import postIcon from "@/app/assets/post.svg";
import ArticleListDetail, { ArticleDetail } from "./ArticleListDetail";
import type { PostCategory } from "@/app/(protected)/types/article";
import ArticleCreateForm from "./ArticleCreateForm";
import { articleService, CommunityPostDto } from "@/app/lib/api/article";

type Mode = "list" | "detail" | "create";

function mapCategory(raw: string): PostCategory {
  // ✅ 우리 프로젝트 카테고리: NOTICE | QUESTION | NORMAL (ALL은 필터에서만)
  if (raw === "NOTICE" || raw === "QUESTION" || raw === "NORMAL") return raw;
  // 서버가 "ALL" 또는 기타 string 내려주면 기본 NORMAL 처리
  return "NORMAL";
}

export default function CommunityArticlePage({
  communityId,
}: {
  communityId: number;
}) {
  const [mode, setMode] = useState<Mode>("list");

  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>();
  const [detail, setDetail] = useState<CommunityPostDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ✅ 목록 조회 함수로 분리 (useEffect + 생성 후 재조회에서 공용으로 사용)
  const fetchPosts = useCallback(async () => {
    if (!Number.isFinite(communityId)) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await articleService.getCommunityPosts(communityId);
      setPosts(data);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "게시글 목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  // ✅ 목록 조회 (일단 첫 페이지: lastId 없이)
  useEffect(() => {
    if (mode !== "list") return;
    fetchPosts();
  }, [mode, fetchPosts]);

  useEffect(() => {
    if (mode !== "detail") return;
    if (!selectedId) return;

    let alive = true;

    (async () => {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(true);

      try {
        const data = await articleService.getCommunityPostById(
          communityId,
          selectedId
        );
        if (!alive) return;
        setDetail(data);
      } catch (e: any) {
        if (!alive) return;
        setDetailError(e?.message ?? "게시글 상세 조회에 실패했습니다.");
      } finally {
        if (!alive) return;
        setDetailLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [mode, communityId, selectedId]);

  /** 목록용 요약 배열 */
  const summaries = useMemo<PostSummary[]>(() => {
    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      author: p.authorNickname,
      createdAt: p.createdAt, // 필요하면 dayjs로 포맷
      category: mapCategory(p.category),
      viewCount: p.views,
      likeCount: p.likes,
      commentCount: p.comments,
      pinned: p.pinned, // ✅ (선택) 상단 고정 표시용으로 쓰고 싶으면 ArticleListItem에서 활용 가능
    }));
  }, [posts]);

  /** 상세 컴포넌트로 넘길 변환 */
  const detailArticle = useMemo<ArticleDetail | null>(() => {
    if (!detail) return null;

    return {
      id: detail.id, // ✅ number로 유지하려면 ArticleDetail 타입도 바꿔야 함
      title: detail.title,
      content: detail.content,

      author: detail.authorNickname,
      createdAt: detail.createdAt,
      viewCount: detail.views,
      category: mapCategory(detail.category),

      likeCount: detail.likes,
      isLiked: false, // TODO
      commentCount: detail.comments,
      comments: [], // TODO: 댓글 API 붙일 때 채우기
    } as any;
  }, [detail]);

  if (mode === "create") {
    return (
      <ArticleCreateForm
        communityId={Number(communityId)}
        onCancel={() => setMode("list")}
        onCreated={() => {
          setMode("list");
          fetchPosts(); // ✅ 목록 재조회
        }}
      />
    );
  }

  /** 상세 화면 */
  if (mode === "detail") {
    return (
      <div className="space-y-3">
        {detailError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {detailError}
          </div>
        )}

        {detailLoading && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600">
            게시글을 불러오는 중...
          </div>
        )}

        {detailArticle && (
          <ArticleListDetail
            article={detailArticle}
            onBack={() => {
              setSelectedId(null);
              setDetail(null);
              setMode("list");
            }}
          />
        )}
      </div>
    );
  }

  /** 목록 화면 */
  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      <ArticleList
        posts={summaries}
        writeIcon={postIcon}
        isLoading={isLoading}
        onClickWrite={() => setMode("create")}
        onClickPost={(id) => {
          setSelectedId(id);
          setMode("detail");
        }}
      />
    </div>
  );
}
