"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

type Props = {
  isOpen: boolean;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;

  onConfirm: () => void;
  onCancel: () => void;

  confirmVariant?: "primary" | "danger";

  messageVariant?: "default" | "body" | "small";
  messageClassName?: string;

  showCancel?: boolean;
  closeOnOverlay?: boolean;
};

export default function ConfirmModal({
  isOpen,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  confirmVariant = "primary",

  messageVariant = "default",
  messageClassName = "",
  showCancel = true,
  closeOnOverlay = true,
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

  const baseMessageClass =
    "text-center text-2xl font-extrabold text-gray-900 whitespace-pre-line";

  const variantClass =
    messageVariant === "body"
      ? "text-base font-bold text-gray-800 leading-relaxed"
      : messageVariant === "small"
      ? "text-sm font-semibold text-gray-700 leading-relaxed"
      : "";

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Overlay */}
      <button
        type="button"
        onClick={() => {
          if (!closeOnOverlay) return;
          onCancel();
        }}
        className="absolute inset-0 bg-black/25 backdrop-blur-xs"
      />

      {/* Modal */}
      <div
        className="
          relative w-[500px] max-w-[calc(100vw-32px)]
          rounded-[18px] border-2 border-gray-500
          bg-white
          px-5 pt-10 pb-5
          shadow-[0_20px_40px_rgba(0,0,0,0.25)]
        "
      >
        <div
          className={`${baseMessageClass} ${variantClass} ${messageClassName}`}
        >
          {message}
        </div>

        <div
          className={`mt-10 grid ${
            showCancel ? "grid-cols-2" : "grid-cols-1"
          } gap-3`}
        >
          <Button type="button" onClick={onConfirm} className="h-12">
            {confirmText}
          </Button>

          {showCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="h-12"
            >
              {cancelText}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
