import { api } from "@/app/lib/api/fetchClient";

export type CommunityPostCategory = "NORMAL" | "NOTICE" | "QUESTION";

export type CommunityPostDto = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  views: number;
  likes: number;
  category: "NORMAL" | "NOTICE" | "QUESTION" | "ALL" | string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorNickname: string;
  comments: number;
  communityId: number;
};

export type CreateCommunityPostPayload = {
  title: string;
  content?: string;
  category: CommunityPostCategory;
  multipartFile?: File | null;
};

export type UpdateCommunityPostPayload = {
  title: string;
  content?: string;
  category: CommunityPostCategory;
  multipartFile?: File | null;
};

export const articleService = {
  /** 커뮤니티 게시글 목록 조회 (무한스크롤: lastId optional) */
  getCommunityPosts: (communityId: number, lastId?: number) => {
    const qs = lastId ? `?lastId=${lastId}` : "";
    return api.get<CommunityPostDto[]>(
      `/communities/${communityId}/posts${qs}`,
      { auth: true }
    );
  },

  getCommunityPostById: (communityId: number, postId: number) => {
    return api.get<CommunityPostDto>(
      `/communities/${communityId}/posts/${postId}`,
      { auth: true }
    );
  },

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<string>("/upload", formData, { auth: true });
  },

  createCommunityPost: (
    communityId: number,
    payload: CreateCommunityPostPayload
  ) => {
    const formData = new FormData();

    formData.append("title", payload.title);
    if (payload.content != null) formData.append("content", payload.content);

    formData.append("communityId", String(communityId));

    formData.append("category", payload.category);

    if (payload.multipartFile) {
      formData.append("multipartFile", payload.multipartFile);
    }

    return api.post<CommunityPostDto>(
      `/communities/${communityId}/posts`,
      formData,
      { auth: true }
    );
  },

  updateCommunityPost: (
    communityId: number,
    postId: number,
    payload: UpdateCommunityPostPayload
  ) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    if (payload.content != null) formData.append("content", payload.content);
    formData.append("communityId", String(communityId));
    formData.append("category", payload.category);
    if (payload.multipartFile)
      formData.append("multipartFile", payload.multipartFile);

    return api.patch<CommunityPostDto>(
      `/communities/${communityId}/posts/${postId}`,
      formData,
      { auth: true }
    );
  },

  deleteCommunityPost: (communityId: number, postId: number) => {
    return api.delete<void>(`/communities/${communityId}/posts/${postId}`, {
      auth: true,
    });
  },

  togglePostLike: (communityId: number, postId: number) => {
    return api.patch<CommunityPostDto>(
      `/communities/${communityId}/posts/${postId}/likes`,
      undefined,
      { auth: true }
    );
  },

  reportPost: (params: {
    postId: number;
    reportedUserId: number;
    reason?: string;
  }) => {
    const qs = new URLSearchParams();
    qs.set("reportedUserId", String(params.reportedUserId));
    if (params.reason?.trim()) qs.set("reason", params.reason.trim());

    return api.post<string>(
      `/reports/posts/${params.postId}?${qs.toString()}`,
      undefined,
      {
        auth: true,
      }
    );
  },

  togglePostPin: (communityId: number, postId: number) => {
    return api.patch<CommunityPostDto>(
      `/communities/${communityId}/posts/${postId}/pin`,
      undefined,
      { auth: true }
    );
  },
};
