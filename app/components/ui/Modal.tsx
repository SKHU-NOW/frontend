"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

type Props = {
  isOpen: boolean;
  message: string;
  confirmText?: string; // 기본 "확인"
  cancelText?: string; // 기본 "취소"

  onConfirm: () => void;
  onCancel: () => void;

  // 옵션: 확인 버튼 스타일 바꾸고 싶으면
  confirmVariant?: "primary" | "danger"; // 기본 primary
};

export default function ConfirmModal({
  isOpen,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  confirmVariant = "primary",
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const confirmBtn =
    confirmVariant === "danger"
      ? "bg-secondary-400 hover:bg-secondary-500 text-white border-secondary-400"
      : "bg-secondary-400 hover:bg-secondary-500 text-white border-secondary-400";

  return createPortal(
    <div
      className="
        fixed inset-0 z-9999
        flex items-center justify-center
      "
    >
      {/* Overlay (그림자 + 모자이크) */}
      <button
        type="button"
        aria-label="close"
        onClick={onCancel}
        className="
          absolute inset-0
          bg-black/25
          backdrop-blur-xs
        "
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="
          relative w-[500px] max-w-[calc(100vw-32px)]
          rounded-[18px] border-2 border-gray-500
          bg-white
          px-5 pt-10 pb-5
          shadow-[0_20px_40px_rgba(0,0,0,0.25)]
        "
      >
        <div className="text-center text-2xl font-extrabold text-gray-900">
          {message}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3">
          <Button type="button" onClick={onConfirm} className="h-12">
            {confirmText}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="h-12"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
