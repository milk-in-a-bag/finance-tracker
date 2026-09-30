"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  total: { label: "Spend (Ksh)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CategoryBarChart({
  data,
}: {
  data: { categoryName: string; total: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full block">
      <BarChart data={data} margin={{ top: 5, right: 4, left: 0, bottom: 5 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeOpacity={0.4}
        />
        <XAxis
          dataKey="categoryName"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={56}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={44}
        />
        <ChartTooltip
          cursor={{ fill: "var(--accent)", opacity: 0.35 }}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
