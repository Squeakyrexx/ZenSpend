
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen md:flex">
        {isClient && !isMobile && (
          <Sidebar collapsible="icon">
            <MainNav />
          </Sidebar>
        )}
        {!isClient && ( // Render a placeholder on the server
            <div className="hidden md:block w-12" />
        )}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        {isClient && isMobile && <MobileNav />}
      </div>
    </SidebarProvider>
  );
}
