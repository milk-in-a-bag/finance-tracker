import Link from "next/link";
import { cn } from "@/lib/utils";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all", label: "All time" },
];

export function PeriodSwitcher({
  current,
  basePath = "/dashboard",
}: {
  current: string;
  basePath?: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 border border-border/60 rounded-lg p-0.5">
      {PERIODS.map((p) => (
        <Link
          key={p.value}
          href={`${basePath}?period=${p.value}`}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-xs font-medium h-7 px-3 transition-all",
            p.value === current
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
