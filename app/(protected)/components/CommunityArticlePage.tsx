"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import TextModal from "@/app/components/ui/TextModal";

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

  const baseOrderRef = useRef<Record<number, number>>({});

  const [reportTarget, setReportTarget] = useState<{
    postId: number;
    reportedUserId: number;
  } | null>(null);

  const [reportReason, setReportReason] = useState("");
  const [isReportTextOpen, setIsReportTextOpen] = useState(false);
  const [isReportConfirmOpen, setIsReportConfirmOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  function reorderByPinnedAndBaseOrder(list: CommunityPostDto[]) {
    const order = baseOrderRef.current;

    return [...list].sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;

      if (bp !== ap) return bp - ap;

      const ai = order[a.id] ?? Number.MAX_SAFE_INTEGER;
      const bi = order[b.id] ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
  }

  const fetchPosts = useCallback(async () => {
    if (!Number.isFinite(communityId)) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await articleService.getCommunityPosts(communityId);

      const nextOrder: Record<number, number> = {};
      data.forEach((p, idx) => {
        nextOrder[p.id] = idx;
      });
      baseOrderRef.current = nextOrder;

      setPosts(reorderByPinnedAndBaseOrder(data));

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

        setPosts((prev) => {
          const replaced = prev.map((p) => (p.id === postId ? updated : p));

          return reorderByPinnedAndBaseOrder(replaced);
        });

        setDetail((prev) => (prev?.id === postId ? updated : prev));
      } catch (e: any) {
        alert(e?.message ?? "게시글 고정 처리에 실패했습니다.");
      }
    },
    [communityId, canPin]
  );

  /** 목록용 요약 배열 */
  const summaries = useMemo<PostSummary[]>(() => {
    const mapped = posts.map((p) => ({
      id: p.id,
      title: p.title,
      author: p.authorNickname,
      authorId: p.authorId,
      createdAt: p.createdAt,
      category: mapCategory(p.category),
      viewCount: p.views,
      likeCount: p.likes,
      commentCount: p.comments,
      pinned: p.pinned,
      isLiked: likedMap[p.id] ?? false,
    }));

    return mapped
      .map((item, idx) => ({ item, idx }))
      .sort((a, b) => {
        const ap = a.item.pinned ? 1 : 0;
        const bp = b.item.pinned ? 1 : 0;
        if (bp !== ap) return bp - ap;
        return a.idx - b.idx;
      })
      .map(({ item }) => item);
  }, [posts, likedMap]);

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
      id: detail.id,
      title: detail.title,
      content: detail.content,

      author: detail.authorNickname,
      createdAt: detail.createdAt,
      viewCount: detail.views,
      category: mapCategory(detail.category),
      imageUrl: detail.imageUrl,

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
      alert(e?.message ?? "게시글 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitComment = async (content: string) => {
    if (!selectedId) return;

    try {
      await commentService.createComment(selectedId, { content });
      await fetchComments(selectedId);
    } catch (e: any) {
      alert(e?.message ?? "댓글 등록에 실패했습니다.");
    }
  };

  const handleRefreshComments = useCallback(async () => {
    if (!selectedId) return;
    await fetchComments(selectedId);
  }, [selectedId, fetchComments]);

  const handleReportPost = useCallback(
    (postId: number) => {
      const target = posts.find((p) => p.id === postId);
      const reportedUserId = target?.authorId;

      if (!reportedUserId) {
        alert("신고 대상 사용자 정보를 찾을 수 없습니다.");
        return;
      }

      // 1) 타겟 저장 + 텍스트 모달 오픈
      setReportTarget({ postId, reportedUserId });
      setReportReason("");
      setIsReportTextOpen(true);
    },
    [posts]
  );

  const handleToggleLike = useCallback(async () => {
    if (!Number.isFinite(communityId)) return;
    if (!selectedId) return;

    const postId = selectedId;
    const prevLiked = likedMap[postId] ?? false;

    setLikedMap((prev) => ({ ...prev, [postId]: !prevLiked }));

    try {
      const updated = await articleService.togglePostLike(communityId, postId);

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

      setLikedMap((prev) => ({ ...prev, [postId]: !prevLiked }));

      try {
        const updated = await articleService.togglePostLike(
          communityId,
          postId
        );

        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));

        setDetail((prev) => (prev?.id === postId ? updated : prev));
      } catch (e: any) {
        setLikedMap((prev) => ({ ...prev, [postId]: prevLiked }));
        alert(e?.message ?? "좋아요 처리에 실패했습니다.");
      }
    },
    [communityId, likedMap]
  );

  const submitReport = useCallback(async () => {
    if (!reportTarget) return;
    if (isReporting) return;

    try {
      setIsReporting(true);

      await articleService.reportPost({
        postId: reportTarget.postId,
        reportedUserId: reportTarget.reportedUserId,
        reason: reportReason,
      });

      alert("신고가 접수되었습니다.");

      setIsReportConfirmOpen(false);
      setIsReportTextOpen(false);
      setReportTarget(null);
      setReportReason("");
    } catch (e: any) {
      alert(e?.message ?? "신고에 실패했습니다.");
    } finally {
      setIsReporting(false);
    }
  }, [reportTarget, reportReason, isReporting]);

  if (mode === "create" || mode === "edit") {
    return (
      <ArticleCreateForm
        communityId={communityId}
        mode={mode === "create" ? "create" : "edit"}
        postId={mode === "edit" ? selectedId ?? undefined : undefined}
        onCancel={() => {
          if (mode === "edit" && selectedId) setMode("detail");
          else setMode("list");
        }}
        onSaved={async (saved) => {
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

      <TextModal
        isOpen={isReportTextOpen}
        title="신고 사유를 입력하세요"
        placeholder="예) 욕설/비방, 불법 광고, 도배 등"
        helperText="입력 후 '다음'을 누르면 최종 확인 창이 열립니다."
        confirmText="다음"
        cancelText="취소"
        initialValue={reportReason}
        onCancel={() => {
          if (isReporting) return;
          setIsReportTextOpen(false);
          setReportTarget(null);
          setReportReason("");
        }}
        onConfirm={(value) => {
          // 2) 텍스트 저장 후 최종 확인창 오픈
          setReportReason(value);
          setIsReportTextOpen(false);
          setIsReportConfirmOpen(true);
        }}
      />

      <ConfirmModal
        isOpen={isReportConfirmOpen}
        message="게시글을 신고하시겠습니까?"
        confirmText={isReporting ? "신고 중..." : "신고"}
        cancelText="취소"
        confirmVariant="danger"
        onCancel={() => {
          if (isReporting) return;
          setIsReportConfirmOpen(false);

          // 다시 사유 입력으로 돌아가고 싶으면 아래처럼:
          setIsReportTextOpen(true);
        }}
        onConfirm={submitReport}
      />
    </div>
  );
}
