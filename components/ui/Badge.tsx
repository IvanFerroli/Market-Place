import { cn } from "@/lib/utils/cn";

export default function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-1 text-xs", className)}>
      {children}
    </span>
  );
}
