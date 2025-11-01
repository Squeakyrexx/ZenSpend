"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Wallet, Sparkles, Settings, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/recurring", label: "Recurring", icon: Repeat },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="grid grid-cols-5 items-center justify-around h-16">
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
         <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary",
              pathname === "/settings" && "text-primary"
            )}
          >
            <Settings className="w-6 h-6" />
            <span>Settings</span>
          </Link>
      </nav>
    </div>
  );
}
