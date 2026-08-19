import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-panel shadow-panel",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-300">
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-600">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
