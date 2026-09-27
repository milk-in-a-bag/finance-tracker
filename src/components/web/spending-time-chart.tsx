"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="total"
          type="monotone"
          stroke="var(--color-total)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
