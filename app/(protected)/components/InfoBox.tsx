export default function InfoBox({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "h-11 w-full rounded-md border border-gray-400 bg-white px-4",
        "flex items-center text-sm font-semibold text-gray-800",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
