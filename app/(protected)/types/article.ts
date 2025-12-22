// app/(protected)/types/article.ts (또는 지금 파일 경로 그대로)

/** 실제 게시글에 저장되는 카테고리 */
export type PostCategory = "NOTICE" | "QUESTION" | "NORMAL";

/** 목록/탭에서만 쓰는 카테고리 (ALL 포함) */
export type PostCategoryFilter = PostCategory | "ALL";

export type Post = {
  id: string;
  title: string;
  author: string;
  commentCount: number;
  createdAt: string;
  category: PostCategory;
};

export const categoryLabelText: Record<PostCategoryFilter, string> = {
  ALL: "전체",
  NOTICE: "공지",
  QUESTION: "질문",
  NORMAL: "일반",
};

export const categoryStyle: Record<
  PostCategoryFilter,
  {
    barBg: string;
    tabBorder: string;
    tabText: string;
    tabBg: string;
  }
> = {
  ALL: {
    barBg: "bg-gray-700",
    tabBorder: "border-gray-700",
    tabText: "text-gray-700",
    tabBg: "bg-gray-700",
  },
  NOTICE: {
    barBg: "bg-[#E45A29]",
    tabBorder: "border-[#E45A29]",
    tabText: "text-[#E45A29]",
    tabBg: "bg-[#E45A29]",
  },
  QUESTION: {
    barBg: "bg-[#F2C94C]",
    tabBorder: "border-[#F2C94C]",
    tabText: "text-[#F2C94C]",
    tabBg: "bg-[#F2C94C]",
  },
  NORMAL: {
    barBg: "bg-[#6B9E73]",
    tabBorder: "border-[#6B9E73]",
    tabText: "text-[#6B9E73]",
    tabBg: "bg-[#6B9E73]",
  },
};
