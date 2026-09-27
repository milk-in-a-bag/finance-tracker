import Link from "next/link";
import { cn } from "@/lib/utils";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

export function PeriodSwitcher({ current }: { current: string }) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <Link
          key={p.value}
          href={`/dashboard?period=${p.value}`}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 transition-colors",
            p.value === current
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
