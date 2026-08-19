import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  unit,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "critical" | "high" | "accent";
  hint?: string;
}) {
  const toneClasses = {
    default: "text-ink-100",
    critical: "text-risk-critical",
    high: "text-risk-high",
    accent: "text-accent",
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-600">{label}</p>
      <p className={cn("mt-1.5 font-mono text-2xl font-semibold leading-none", toneClasses)}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-ink-500">{unit}</span>}
      </p>
      {hint && <p className="mt-1.5 text-[11px] text-ink-600">{hint}</p>}
    </div>
  );
}
