"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Stable color per category name — same category always gets the same color
// regardless of sort order or period.
// Explicit color assignments per category name for maximum visual distinction.
// Falls back to a hash-based pick for any category not listed here.
const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f97316", // orange
  "Friends & Family": "#06b6d4", // cyan
  Transport: "#a78bfa", // violet
  Rent: "#f43f5e", // rose
  Bills: "#facc15", // yellow
  Airtime: "#4ade80", // green
  Entertainment: "#e879f9", // fuchsia
  Miscellaneous: "#64748b", // slate
};

const FALLBACK_PALETTE = [
  "#38bdf8", // sky
  "#fb923c", // orange-400
  "#34d399", // emerald
  "#c084fc", // purple-400
  "#f472b6", // pink-400
  "#fbbf24", // amber-400
  "#2dd4bf", // teal-400
  "#818cf8", // indigo-400
];

function categoryColor(name: string): string {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  // Stable hash fallback for custom categories
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
}

function buildConfig(
  data: { categoryName: string; total: number }[],
): ChartConfig {
  return Object.fromEntries(
    data.map((d) => [
      d.categoryName,
      { label: d.categoryName, color: categoryColor(d.categoryName) },
    ]),
  ) satisfies ChartConfig;
}

export function CategoryBarChart({
  data,
}: {
  data: { categoryName: string; total: number }[];
}) {
  const config = buildConfig(data);
  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);

  const slices = data.map((d) => ({
    ...d,
    fill: categoryColor(d.categoryName),
  }));

  return (
    <ChartContainer config={config} className="h-[220px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="categoryName"
              formatter={(value, name) => {
                const pct =
                  grandTotal > 0
                    ? ((Number(value) / grandTotal) * 100).toFixed(1)
                    : "0";
                return (
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold text-foreground">
                      {name}
                    </span>
                    <span className="text-muted-foreground">
                      Ksh{" "}
                      {Number(value).toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </span>
                );
              }}
            />
          }
        />
        <Pie
          data={slices}
          dataKey="total"
          nameKey="categoryName"
          innerRadius="38%"
          outerRadius="78%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {slices.map((s, i) => (
            <Cell key={i} fill={s.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="categoryName" />}
          className="flex-wrap gap-x-4 gap-y-1 text-xs"
        />
      </PieChart>
    </ChartContainer>
  );
}
