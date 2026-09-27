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
    <ChartContainer config={chartConfig} className="h-[280px] w-full block">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="categoryName"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
