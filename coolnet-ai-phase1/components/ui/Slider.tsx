export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
  const display = formatValue ? formatValue(value) : `${value > 0 ? "+" : ""}${value}${unit ?? ""}`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </label>
        <span className="font-mono text-sm font-semibold text-accent">{display}</span>
      </div>
      <input
        type="range"
        className="coolnet-slider w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between text-[10px] text-ink-600">
        <span>
          {min > 0 ? "+" : ""}
          {min}
          {unit}
        </span>
        <span>
          {max > 0 ? "+" : ""}
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
