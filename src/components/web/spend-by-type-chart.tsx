"use client";

import { Bar, BarChart, XAxis, YAxis, Cell, LabelList } from "recharts";
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
  // Height scales with number of bars so short lists don't feel cramped
  const chartHeight = Math.max(160, data.length * 52);

  return (
    <ChartContainer
      config={chartConfig}
      style={{ height: chartHeight }}
      className="w-full"
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 80, left: 8, bottom: 0 }}
        barCategoryGap="20%"
        barSize={32}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="type"
          tickLine={false}
          axisLine={false}
          width={80}
          tick={(props: {
            x: number;
            y: number;
            payload: { value: string };
          }) => (
            <text
              x={props.x - 76}
              y={props.y}
              dy={4}
              textAnchor="start"
              fill="var(--muted-foreground)"
              fontSize={11}
            >
              {props.payload.value}
            </text>
          )}
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
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.type}
              fill={TYPE_COLORS[entry.type] ?? "var(--chart-1)"}
            />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            style={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            formatter={(v: number) => `Ksh ${v.toLocaleString()}`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
