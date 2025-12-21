"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const ButtonGray = forwardRef<HTMLButtonElement, ButtonProps>(
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
    const baseStyles = `${className ?? "w-full"} ${
      className ?? "h-[40px]"
    } flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer`;

    const variantStyles = {
      primary: clsx(
        "bg-gray-600 text-white",
        !disabled && "hover:bg-gray-700 active:bg-gray-800",
        disabled && "bg-gray-300 text-gray-400 cursor-not-allowed"
      ),
      secondary: clsx(
        "bg-white border border-gray-400 text-gray-400",
        !disabled && "hover:bg-gray-300 active:bg-gray-400",
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

ButtonGray.displayName = "Button";

export default ButtonGray;
