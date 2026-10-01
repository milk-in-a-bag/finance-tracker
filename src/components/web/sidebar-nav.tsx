"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2 10a8 8 0 1 1 16 0A8 8 0 0 1 2 10Zm8-5a1 1 0 0 1 1 1v3.586l2.707 2.707a1 1 0 0 1-1.414 1.414l-3-3A1 1 0 0 1 7 10V6a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path
          fillRule="evenodd"
          d="M10 2a.75.75 0 0 1 .75.75v.258a33.186 33.186 0 0 1 3.349.34.75.75 0 1 1-.198 1.487 31.717 31.717 0 0 0-2.15-.234v1.63l.679.215.062.024c.892.359 1.594.801 2.082 1.382.513.612.773 1.348.773 2.14 0 1.531-.987 2.65-2.35 3.062a18.992 18.992 0 0 1-.884.218v1.51c.842-.097 1.647-.273 2.412-.524a.75.75 0 0 1 .474 1.425 19.48 19.48 0 0 1-2.886.596v.25a.75.75 0 0 1-1.5 0v-.273a33.198 33.198 0 0 1-3.293-.349.75.75 0 1 1 .198-1.487 31.558 31.558 0 0 0 2.095.232v-1.617l-.503-.16c-.928-.317-1.69-.77-2.22-1.374-.554-.634-.832-1.4-.832-2.26 0-1.47.97-2.55 2.29-2.99.237-.077.49-.14.765-.192V3.43a31.515 31.515 0 0 0-2.211.266.75.75 0 1 1-.198-1.487 33.07 33.07 0 0 1 2.41-.316V2.75A.75.75 0 0 1 10 2Zm-1.5 3.83a2.394 2.394 0 0 0-.853.484c-.31.312-.397.65-.397.936 0 .424.099.718.286.946.204.247.554.48 1.103.682l.361.114V5.642a4.803 4.803 0 0 0-.5.188Zm2.25 5.728v1.547c.535-.12.873-.328 1.072-.561.19-.22.278-.5.278-.844 0-.408-.1-.693-.279-.912-.19-.234-.527-.459-1.071-.667V11.558Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/categories",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path
          fillRule="evenodd"
          d="M5.5 3A2.5 2.5 0 0 0 3 5.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 8.38 3H5.5ZM6 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Insights",
    href: "/insights",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 3.5 10Z" />
      </svg>
    ),
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-card border-r border-border/60 min-h-screen">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border/60">
        <span className="font-bold text-lg tracking-tight">
          <span className="text-primary">M</span>-Pesa
          <span className="text-muted-foreground font-normal text-sm ml-1">
            Tracker
          </span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border/60">
        <p className="text-xs text-muted-foreground">M-Pesa Finance Tracker</p>
      </div>
    </aside>
  );
}
