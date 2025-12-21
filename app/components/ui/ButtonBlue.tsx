"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const ButtonBlue = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      title,
      children,
      variant = "primary",
      disabled = false,
      className,
      ...rest
    },
    ref
  ) => {
    const baseStyles = `${
      className ?? "w-full"
    } h-[40px] flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer`;

    const variantStyles = {
      primary: clsx(
        "bg-secondary-500 text-white",
        !disabled && "hover:bg-secondary-600 active:bg-secondary-700",
        disabled && "bg-gray-300 text-gray-400 cursor-not-allowed"
      ),
      secondary: clsx(
        "bg-white border border-secondary-500 text-secondary-500",
        !disabled && "hover:bg-secondary-50 active:bg-secondary-100",
        disabled &&
          "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
      ),
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(baseStyles, variantStyles[variant], className)}
        {...rest}
      >
        {children || title}
      </button>
    );
  }
);

ButtonBlue.displayName = "Button";

export default ButtonBlue;
