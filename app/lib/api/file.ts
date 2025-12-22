// app/lib/api/file.ts
import { api } from "@/app/lib/api/fetchClient";

export type CommunityResourceDto = {
  id: number;
  title: string;
  fileId: string; // ✅ 실제로는 S3 URL(다운로드 링크)
  uploaderId: number;
  createdAt: string;
  updatedAt: string;
};

export const fileService = {
  /** 커뮤니티 자료 목록 조회 (무한스크롤: lastId optional) */
  getCommunityResources: (communityId: number, lastId?: number) => {
    const qs = lastId ? `?lastId=${lastId}` : "";
    return api.get<CommunityResourceDto[]>(
      `/communities/${communityId}/resources${qs}`,
      { auth: true }
    );
  },

  createCommunityResource: (
    communityId: number,
    payload: { title: string; multipartFile: File }
  ) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("multipartFile", payload.multipartFile);

    return api.post<CommunityResourceDto>(
      `/communities/${communityId}/resources`,
      formData,
      { auth: true }
    );
  },
};
