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
  content?: string; // swagger에서 optional처럼 보여서 optional 처리
  category: CommunityPostCategory;
  multipartFile?: File | null; // swagger 필드명 기준
  // communityId는 path로도 가지만, swagger에 body required로 보여서 FormData에도 같이 넣어줌
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
    formData.append("file", file); // ✅ swagger 기준 key: file
    return api.post<string>("/upload", formData, { auth: true });
  },

  createCommunityPost: (
    communityId: number,
    payload: CreateCommunityPostPayload
  ) => {
    const formData = new FormData();

    formData.append("title", payload.title);
    if (payload.content != null) formData.append("content", payload.content);

    // ✅ swagger에 communityId가 body required로 떠서 같이 넣어줌 (path + body 둘 다)
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
};
