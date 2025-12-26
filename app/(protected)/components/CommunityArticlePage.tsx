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
import { useAuth } from "@/app/providers/AuthProvider";
import ConfirmModal from "@/app/components/ui/Modal";
import { commentService, CommunityCommentDto } from "@/app/lib/api/comment";

type Mode = "list" | "detail" | "create" | "edit";

function mapCategory(raw: string): PostCategory {
  if (raw === "NOTICE" || raw === "QUESTION" || raw === "NORMAL") return raw;
  return "NORMAL";
}

export default function CommunityArticlePage({
  communityId,
  adminNickname,
}: {
  communityId: number;
  adminNickname: string;
}) {
  const { user } = useAuth?.() as any;
  const currentUserId: number = Number.isFinite(user?.id)
    ? Number(user.id)
    : -1;

  const myNickname = String(user?.nickname ?? "").trim();
  const canPin =
    myNickname.length > 0 && myNickname === String(adminNickname ?? "").trim();

  const [mode, setMode] = useState<Mode>("list");

  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>();
  const [detail, setDetail] = useState<CommunityPostDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommunityCommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  const fetchPosts = useCallback(async () => {
    if (!Number.isFinite(communityId)) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await articleService.getCommunityPosts(communityId);
      setPosts(data);

      setLikedMap((prev) => {
        const next = { ...prev };
        for (const p of data) {
          if (next[p.id] == null) next[p.id] = false;
        }
        return next;
      });
    } catch (e: any) {
      setErrorMsg(e?.message ?? "게시글 목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (mode !== "list") return;
    fetchPosts();
  }, [mode, fetchPosts]);

  const fetchComments = useCallback(async (postId: number) => {
    if (!Number.isFinite(postId)) return;

    setCommentsLoading(true);
    try {
      const data = await commentService.getCommentsByPostId(postId);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "detail") return;
    if (!Number.isFinite(communityId)) return;
    if (!selectedId) return;

    let alive = true;

    (async () => {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(true);
      setComments([]);

      try {
        const data = await articleService.getCommunityPostById(
          communityId,
          selectedId
        );
        if (!alive) return;
        setDetail(data);

        setLikedMap((prev) =>
          prev[selectedId] == null ? { ...prev, [selectedId]: false } : prev
        );

        fetchComments(selectedId);
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
  }, [mode, communityId, selectedId, fetchComments]);

  const handleTogglePinInList = useCallback(
    async (postId: number) => {
      if (!canPin) return;
      if (!Number.isFinite(communityId)) return;
      if (!Number.isFinite(postId)) return;

      try {
        const updated = await articleService.togglePostPin(communityId, postId);

        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
        setDetail((prev) => (prev?.id === postId ? updated : prev));
      } catch (e: any) {
        alert(e?.message ?? "게시글 고정 처리에 실패했습니다.");
      }
    },
    [communityId, canPin]
  );

  /** 목록용 요약 배열 */
  const summaries = useMemo<PostSummary[]>(() => {
    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      author: p.authorNickname,
      authorId: p.authorId,
      createdAt: p.createdAt, // 필요하면 dayjs로 포맷
      category: mapCategory(p.category),
      viewCount: p.views,
      likeCount: p.likes,
      commentCount: p.comments,
      pinned: p.pinned, // ✅ (선택) 상단 고정 표시용으로 쓰고 싶으면 ArticleListItem에서 활용 가능
      isLiked: likedMap[p.id] ?? false,
    }));
  }, [posts, likedMap]);

  // ✅ 댓글 DTO -> ArticleComments에 맞는 형태로 변환
  const mappedComments = useMemo(() => {
    return comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorNickname: c.authorNickname,
      content: c.content,
      createdAt: c.createdAt,
    }));
  }, [comments]);

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
      isLiked: likedMap[detail.id] ?? false,

      commentCount: comments.length || detail.comments,
      comments: mappedComments,
      commentsLoading,
    };
  }, [detail, mappedComments, comments.length, commentsLoading, likedMap]);

  const openDetail = (postId: number) => {
    setSelectedId(postId);
    setMode("detail");
  };

  const openEdit = (postId: number) => {
    setSelectedId(postId);
    setMode("edit");
  };

  const openDelete = (postId: number) => {
    setDeleteTargetId(postId);
  };

  const handleConfirmDelete = async () => {
    if (!Number.isFinite(communityId)) return;
    if (!deleteTargetId) return;
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await articleService.deleteCommunityPost(communityId, deleteTargetId);

      setDeleteTargetId(null);
      await fetchPosts();

      // 삭제된 글을 보고 있었으면 목록으로
      if (selectedId === deleteTargetId) {
        setSelectedId(null);
        setDetail(null);
        setMode("list");
      }
    } catch (e: any) {
      // 실패하면 모달은 닫지 않고 메시지만 바꾸고 싶으면 state 추가하면 됨
      alert(e?.message ?? "게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ 댓글 등록 핸들러
  const handleSubmitComment = async (content: string) => {
    if (!selectedId) return;

    try {
      await commentService.createComment(selectedId, { content });
      // 등록 후 최신 목록 재조회
      await fetchComments(selectedId);
    } catch (e: any) {
      alert(e?.message ?? "댓글 등록에 실패했습니다.");
    }
  };

  const handleRefreshComments = useCallback(async () => {
    if (!selectedId) return;
    await fetchComments(selectedId);
  }, [selectedId, fetchComments]);

  /** ✅ 게시글 신고 연결 */
  const handleReportPost = useCallback(
    async (postId: number) => {
      // 목록 state에서 authorId 확보
      const target = posts.find((p) => p.id === postId);
      const reportedUserId = target?.authorId;

      if (!reportedUserId) {
        alert("신고 대상 사용자 정보를 찾을 수 없습니다.");
        return;
      }

      // (선택) 사유 입력
      const reason = window.prompt("신고 사유를 입력하세요 (선택)", "") ?? "";

      try {
        await articleService.reportPost({
          postId,
          reportedUserId,
          reason,
        });
        alert("신고가 접수되었습니다.");
      } catch (e: any) {
        alert(e?.message ?? "신고에 실패했습니다.");
      }
    },
    [posts]
  );

  const handleToggleLike = useCallback(async () => {
    if (!Number.isFinite(communityId)) return;
    if (!selectedId) return;

    const postId = selectedId;
    const prevLiked = likedMap[postId] ?? false;

    // 1) optimistic: 하트 상태만 먼저 토글
    setLikedMap((prev) => ({ ...prev, [postId]: !prevLiked }));

    try {
      // 2) 서버 토글
      const updated = await articleService.togglePostLike(communityId, postId);

      // 3) 상세/목록 likes 동기화
      setDetail(updated);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch (e: any) {
      // 실패 시 롤백
      setLikedMap((prev) => ({ ...prev, [postId]: prevLiked }));
      alert(e?.message ?? "좋아요 처리에 실패했습니다.");
    }
  }, [communityId, selectedId, likedMap]);

  const handleToggleLikeInList = useCallback(
    async (postId: number) => {
      if (!Number.isFinite(communityId)) return;
      if (!Number.isFinite(postId)) return;

      const prevLiked = likedMap[postId] ?? false;

      // optimistic
      setLikedMap((prev) => ({ ...prev, [postId]: !prevLiked }));

      try {
        const updated = await articleService.togglePostLike(
          communityId,
          postId
        );

        // 목록 갱신
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));

        // 만약 지금 상세 보고 있는 글이라면 상세도 같이 갱신
        setDetail((prev) => (prev?.id === postId ? updated : prev));
      } catch (e: any) {
        setLikedMap((prev) => ({ ...prev, [postId]: prevLiked }));
        alert(e?.message ?? "좋아요 처리에 실패했습니다.");
      }
    },
    [communityId, likedMap]
  );

  if (mode === "create" || mode === "edit") {
    return (
      <ArticleCreateForm
        communityId={communityId}
        mode={mode === "create" ? "create" : "edit"}
        postId={mode === "edit" ? selectedId ?? undefined : undefined}
        onCancel={() => {
          // edit였다면 detail로, create였다면 list로 돌아가게
          if (mode === "edit" && selectedId) setMode("detail");
          else setMode("list");
        }}
        onSaved={async (saved) => {
          // 저장 후 목록 갱신 + 해당 글 상세로 이동
          await fetchPosts();
          setSelectedId(saved.id);
          setMode("detail");
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
            currentUserId={currentUserId}
            onRefreshComments={handleRefreshComments}
            onBack={() => {
              setSelectedId(null);
              setDetail(null);
              setComments([]);
              setMode("list");
            }}
            onSubmitComment={handleSubmitComment}
            onToggleLike={handleToggleLike}
          />
        )}

        <ConfirmModal
          isOpen={deleteTargetId != null}
          message="게시글을 삭제하겠습니까?"
          confirmText={isDeleting ? "삭제 중..." : "삭제"}
          cancelText="취소"
          confirmVariant="danger"
          onCancel={() => {
            if (isDeleting) return;
            setDeleteTargetId(null);
          }}
          onConfirm={handleConfirmDelete}
        />
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
        currentUserId={currentUserId}
        canPin={canPin}
        onClickWrite={() => setMode("create")}
        onClickPost={(id) => openDetail(id)}
        onEdit={(id) => openEdit(id)}
        onDelete={(id) => openDelete(id)}
        onReport={(id) => handleReportPost(id)}
        onToggleLike={(id) => handleToggleLikeInList(id)}
        onTogglePin={(id) => handleTogglePinInList(id)}
      />

      <ConfirmModal
        isOpen={deleteTargetId != null}
        message="게시글을 삭제하겠습니까?"
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        cancelText="취소"
        confirmVariant="danger"
        onCancel={() => {
          if (isDeleting) return;
          setDeleteTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
