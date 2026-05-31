"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: "◆" },
  { label: "Projects", href: "/projects", icon: "◈" },
  { label: "Logs", href: "/logs", icon: "▤" },
  { label: "Incidents", href: "/incidents", icon: "▲" },
  { label: "Alerts", href: "/alerts", icon: "●" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-bg-surface border-r border-border-muted flex flex-col z-50">
      <div className="px-6 pt-6 pb-4 border-b border-border-muted">
        <h1 className="text-text-heading text-sm font-semibold tracking-widest uppercase">
          API Guardian
        </h1>
        <p className="text-text-muted text-[11px] mt-0.5 tracking-wider">
          Monitoring Dashboard
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-xs rounded-md transition-all duration-150",
                active
                  ? "bg-accent-muted text-accent"
                  : "text-text-muted hover:text-text-default hover:bg-bg-hover"
              )}
            >
              <span className="text-sm w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-border-muted">
        <p className="text-text-muted text-[10px] tracking-wider">v0.1.0</p>
      </div>
    </aside>
  );
}
