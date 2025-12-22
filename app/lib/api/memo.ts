import { api } from "@/app/lib/api/fetchClient";

export type MemoColor = "RED" | "YELLOW" | "GREEN" | "BLUE" | "PURPLE" | string;

export type MemoDto = {
  id: number;
  boardId: number;
  contentText: string;
  color: MemoColor;
  posX: number; // 0~1 (비율)
  posY: number; // 0~1 (비율)
  drawingImageUrl: string;
  createdAt: string;
};

export type CreateMemoPayload = {
  boardId: number;
  contentText: string;
  posX: number; // 0~1
  posY: number; // 0~1
  drawingImageUrl: string; // 없으면 ""로 보내도 됨
};

export const memoService = {
  /** 메모 조회 (기본: 오늘 메모 / all=true면 전체) */
  getMemos: (all?: boolean) => {
    const qs = all ? "?all=false" : "";
    // ✅ 인증 없이 가능하므로 auth 옵션 안 넣음
    return api.get<MemoDto[]>(`/memos${qs}`);
  },

  /** 메모 작성 */
  createMemo: (payload: CreateMemoPayload) => {
    return api.post<MemoDto>("/memos", payload);
  },
};
