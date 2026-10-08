"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Transactions", color: "var(--chart-2)" },
} satisfies ChartConfig;

type DayStats = { day: string; count: number; total: number };

// Shorten day names to fit the axis
const SHORT: Record<string, string> = {
  Sunday: "Sun", Monday: "Mon", Tuesday: "Tue",
  Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat",
};

export function ActivityByDayChart({ data }: { data: DayStats[] }) {
  const ticks = Array.from(
    { length: Math.ceil(Math.max(...data.map((d) => d.count), 0) / 1) + 1 },
    (_, i) => i,
  ).filter((n) => n <= Math.max(...data.map((d) => d.count)));

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <BarChart
        data={data.map((d) => ({ ...d, day: SHORT[d.day] ?? d.day }))}
        margin={{ top: 5, right: 4, left: 0, bottom: 5 }}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={24}
          allowDecimals={false}
          tickCount={Math.max(...data.map((d) => d.count)) + 2}
        />
        <ChartTooltip
          cursor={{ fill: "var(--accent)", opacity: 0.35 }}
          content={
            <ChartTooltipContent
              formatter={(value, _name, props) =>
                `${value} txn${Number(value) !== 1 ? "s" : ""} · Ksh ${Number(props.payload.total).toFixed(0)}`
              }
              hideLabel={false}
              labelKey="day"
            />
          }
        />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
