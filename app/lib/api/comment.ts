import { api } from "@/app/lib/api/fetchClient";

export type CommunityCommentDto = {
  id: number;
  content: string;
  likes: number;
  authorId: number;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportCommentResponse = {
  success: boolean;
  data: string;
  message: string;
};

export const commentService = {
  /** 댓글 목록 조회 */
  getCommentsByPostId: (postId: number) => {
    return api.get<CommunityCommentDto[]>(`/posts/${postId}/comments`, {
      auth: true,
    });
  },

  /** 댓글 작성 */
  createComment: (postId: number, payload: { content: string }) => {
    return api.post<CommunityCommentDto>(`/posts/${postId}/comments`, payload, {
      auth: true,
    });
  },

  /** 댓글 수정 */
  updateComment: (commentId: number, payload: { content: string }) => {
    return api.patch<CommunityCommentDto>(`/comments/${commentId}`, payload, {
      auth: true,
    });
  },

  /** 댓글 삭제 */
  deleteComment: (commentId: number) => {
    return api.delete<void>(`/comments/${commentId}`, { auth: true });
  },

  /**
   * 댓글 신고
   * POST /reports/comments/{commentId}?reportedUserId=...&reason=...
   */
  reportComment: (
    commentId: number,
    params: { reportedUserId: number; reason?: string }
  ) => {
    const qs = new URLSearchParams();
    qs.set("reportedUserId", String(params.reportedUserId));
    if (params.reason) qs.set("reason", params.reason);

    return api.post<ReportCommentResponse>(
      `/reports/comments/${commentId}?${qs.toString()}`,
      undefined,
      { auth: true }
    );
  },
};
