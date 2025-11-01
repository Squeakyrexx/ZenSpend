"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  // The sidebar state is managed by the provider, we can read the cookie to set the default state.
  // We will let the provider handle it for this simple case.
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen md:flex">
        {!isMobile && (
          <Sidebar collapsible="icon">
            <MainNav />
          </Sidebar>
        )}
        <main className="flex-1">
          {children}
        </main>
        {isMobile && <MobileNav />}
      </div>
    </SidebarProvider>
  );
}
