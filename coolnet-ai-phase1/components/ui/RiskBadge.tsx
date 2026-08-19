import type { RiskLevel } from "@/lib/types";
import { RISK_BG_CLASSES, RISK_TEXT_CLASSES } from "@/lib/utils/risk";
import { cn } from "@/lib/utils/cn";

export function RiskBadge({
  level,
  size = "md",
  pulse = false,
}: {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border font-semibold tracking-wide",
        RISK_BG_CLASSES[level],
        RISK_TEXT_CLASSES[level],
        sizeClasses
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          pulse && (level === "CRITICAL" || level === "HIGH") && "risk-pulse"
        )}
        style={{ backgroundColor: "currentColor" }}
      />
      {level}
    </span>
  );
}
