
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Wallet, CalendarDays, Repeat, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="grid grid-cols-4 items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary",
              pathname === item.href && "text-primary"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
