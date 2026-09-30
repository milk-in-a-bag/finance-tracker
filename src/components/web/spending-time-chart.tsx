"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  total: { label: "Spend (Ksh)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function SpendingTimeChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <AreaChart data={data} margin={{ top: 5, right: 4, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-total)"
              stopOpacity={0.25}
            />
            <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeOpacity={0.4}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={44}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="total"
          type="monotone"
          stroke="var(--color-total)"
          strokeWidth={2}
          fill="url(#totalGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-total)" }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
