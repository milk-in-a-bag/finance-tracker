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

// One config entry per possible slice — keyed by index so any number of
// categories gets a colour from the palette automatically.
const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function buildConfig(
  data: { categoryName: string; total: number }[],
): ChartConfig {
  return Object.fromEntries(
    data.map((d, i) => [
      d.categoryName,
      { label: d.categoryName, color: PALETTE[i % PALETTE.length] },
    ]),
  ) satisfies ChartConfig;
}

export function CategoryBarChart({
  data,
}: {
  data: { categoryName: string; total: number }[];
}) {
  const config = buildConfig(data);

  // Recharts Pie expects a flat array with a `fill` on each entry.
  const slices = data.map((d, i) => ({
    ...d,
    fill: PALETTE[i % PALETTE.length],
  }));

  return (
    <ChartContainer config={config} className="h-[220px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="categoryName"
              formatter={(value, name) => (
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">{name}</span>
                  <span className="text-muted-foreground">
                    Ksh{" "}
                    {Number(value).toLocaleString("en-KE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </span>
              )}
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
