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

function buildTicks(data: { total: number }[]): number[] {
  const max = Math.max(...data.map((d) => d.total), 0);
  if (max === 0) return [0];
  // Pick a step size that gives ~5 ticks regardless of the max value
  const rawStep = max / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let i = 0; i <= top; i += step) ticks.push(i);
  return ticks;
}

export function SpendingTimeChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  const ticks = buildTicks(data);
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
          ticks={ticks}
          domain={[0, ticks[ticks.length - 1]]}
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
