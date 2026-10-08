"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const TYPE_COLORS: Record<string, string> = {
  SENT: "var(--chart-5)",
  PAYBILL: "var(--chart-1)",
  AIRTIME: "var(--chart-4)",
  WITHDRAWAL: "var(--chart-3)",
};

const chartConfig = {
  total: { label: "Total (Ksh)" },
} satisfies ChartConfig;

type SpendByType = { type: string; total: number; count: number };

export function SpendByTypeChart({ data }: { data: SpendByType[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <BarChart data={data} margin={{ top: 5, right: 4, left: 0, bottom: 5 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeOpacity={0.4}
        />
        <XAxis
          dataKey="type"
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
          tickCount={5}
          domain={[0, (max: number) => Math.ceil(max / 100) * 100]}
        />
        <ChartTooltip
          cursor={{ fill: "var(--accent)", opacity: 0.35 }}
          content={
            <ChartTooltipContent
              formatter={(value, _name, props) =>
                `${props.payload.count} txns · Ksh ${Number(value).toFixed(2)}`
              }
              hideLabel={false}
              labelKey="type"
            />
          }
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.type}
              fill={TYPE_COLORS[entry.type] ?? "var(--chart-1)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
