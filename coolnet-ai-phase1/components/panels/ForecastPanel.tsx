"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskForecast } from "@/lib/types";
import { CardHeader } from "@/components/ui/Card";
import { DemoTag } from "@/components/ui/DemoTag";

export function ForecastPanel({ forecast }: { forecast: RiskForecast | null }) {
  if (!forecast) {
    return (
      <div className="px-4 py-6 text-center text-xs text-ink-600">
        Select a ward to view its forecast.
      </div>
    );
  }

  const chartData = forecast.points.map((p) => ({
    label: p.label,
    risk: p.risk_score,
  }));

  const trendText = forecast.points.map((p) => p.risk_score).join(" → ");

  return (
    <div>
      <CardHeader
        title="Risk Forecast"
        subtitle="Near-term outlook (NOW / 30 MIN / 60 MIN)"
        right={<DemoTag label="DEMO FORECAST" />}
      />
      <div className="px-4 py-4">
        <p className="mb-3 font-mono text-sm text-ink-300">{trendText}</p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#1a2333" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8a97ab", fontSize: 11 }}
                axisLine={{ stroke: "#1e2837" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#8a97ab", fontSize: 11 }}
                axisLine={{ stroke: "#1e2837" }}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "#0d121a",
                  border: "1px solid #1e2837",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#c3ccd9" }}
                itemStyle={{ color: "#2dd4bf" }}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#2dd4bf"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#2dd4bf", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-600">
          This is a demo forecast extrapolation for Phase 1 UI development.
          It is not a real prediction from a trained model.
        </p>
      </div>
    </div>
  );
}
