"use client";

type Props = {
  isOpen: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  // 지금은 "내 글" 케이스: 수정/삭제만
  variant?: "owner" | "other"; // 나중에 other는 신고만 보여주기 용
};

export default function ArticleActionMenu({
  isOpen,
  onEdit,
  onDelete,
  onClose,
  variant = "owner",
}: Props) {
  if (!isOpen) return null;

  const isOwner = variant === "owner";

  return (
    <>
      {/* ✅ 바깥 클릭 시 닫기용 오버레이 (투명) */}
      <button
        type="button"
        aria-label="close menu overlay"
        onClick={onClose}
        className="fixed inset-0 z-60 cursor-default bg-transparent"
      />

      {/* ✅ 메뉴 본체 */}
      <div className="absolute z-70 right-[-72px] top-[8px]">
        <div className="w-[62px] overflow-hidden rounded-2xl border border-gray-500 bg-white shadow-lg">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => {
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
                onClick={() => {
                  onDelete?.();
                  onClose();
                }}
                className="h-10 w-full text-[16px] font-semibold text-gray-800 hover:text-primary-500"
              >
                삭제
              </button>
            </>
          )}

          {/* 나중에 다른 유저 글이면 신고만 */}
          {!isOwner && (
            <button
              type="button"
              onClick={() => {
                // onReport?.();
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
