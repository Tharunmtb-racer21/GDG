import { cn } from "@/lib/utils/cn";

export function DemoTag({ className, label = "DEMO DATA" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent",
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-accent" />
      {label}
    </span>
  );
}
