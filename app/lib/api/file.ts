import { api } from "@/app/lib/api/fetchClient";

export type CommunityResourceDto = {
  id: number;
  title: string;
  imageUrl: string;
  uploaderId: number;
  uploaderNickname: string;
  createdAt: string;
  updatedAt: string;
};

export type DownloadResourceResponse = {
  resourceId: number;
  downloadUrl: string;
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

  getResourceDownloadUrl: (resourceId: number) => {
    return api.get<DownloadResourceResponse>(
      `/communities/${resourceId}/download`,
      { auth: true }
    );
  },

  deleteCommunityResource: (resourceId: number) => {
    return api.delete<void>(`/communities/resources/${resourceId}`, {
      auth: true,
    });
  },
};
