"use client";

type Props = {
  isOpen: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onClose: () => void;
  variant?: "owner" | "other";
};

export default function ArticleActionMenu({
  isOpen,
  onEdit,
  onDelete,
  onReport,
  onClose,
  variant = "owner",
}: Props) {
  if (!isOpen) return null;

  const isOwner = variant === "owner";

  return (
    <>
      <button
        type="button"
        aria-label="close menu overlay"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed inset-0 z-60 cursor-default bg-transparent"
      />

      <div
        className="absolute z-70 right-[-72px] top-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[62px] overflow-hidden rounded-2xl border border-gray-500 bg-white shadow-lg">
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                  onClose();
                }}
                className="h-10 w-full text-[16px] font-semibold text-gray-800 hover:text-primary-500"
              >
                수정
              </button>
              <div className="h-[0.5px] w-full bg-gray-500" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                  onClose();
                }}
                className="h-10 w-full text-[16px] font-semibold text-gray-800 hover:text-primary-500"
              >
                삭제
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReport?.();
                onClose();
              }}
              className="h-12 w-full text-[16px] font-semibold text-orange-500 hover:bg-gray-50"
            >
              신고
            </button>
          )}
        </div>
      </div>
    </>
  );
}
