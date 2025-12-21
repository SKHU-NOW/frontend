"use client";

import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Field({ className, ...props }: Props) {
  return (
    <input
      {...props}
      className={clsx(
        "h-11 w-full rounded-md border border-gray-400 px-4 text-sm outline-none",
        "transition-colors",
        "hover:border-primary-500 focus:border-primary-500",
        className
      )}
    />
  );
}
