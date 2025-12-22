"use client";

import clsx from "clsx";
import type { PostCategory, PostCategoryFilter } from "../types/article";
import { categoryLabelText, categoryStyle } from "../types/article";

type Props =
  | {
      showAll: true;
      value: PostCategoryFilter;
      onChange: (v: PostCategoryFilter) => void;
    }
  | {
      showAll?: false; // 기본 false
      value: PostCategory;
      onChange: (v: PostCategory) => void;
    };

export default function ArticleCategoryTabs(props: Props) {
  const showAll = props.showAll ?? false;

  const tabs = (
    showAll
      ? (["ALL", "NOTICE", "QUESTION", "NORMAL"] as const)
      : (["NOTICE", "QUESTION", "NORMAL"] as const)
  ) as readonly (PostCategoryFilter | PostCategory)[];

  return (
    <div className="flex items-center gap-3">
      {tabs.map((tab) => {
        const isActive = props.value === tab;

        const st = categoryStyle[tab as PostCategory];

        const base =
          "h-8 rounded-full px-3 text-sm font-semibold transition-colors border-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]";

        return (
          <button
            key={tab}
            type="button"
            onClick={() => (props as any).onChange(tab)}
            className={clsx(
              base,
              isActive
                ? `${st.tabBg} text-white ${st.tabBorder}`
                : `bg-white ${st.tabText} ${st.tabBorder} hover:bg-gray-50`
            )}
          >
            {categoryLabelText[tab]}
          </button>
        );
      })}
    </div>
  );
}
