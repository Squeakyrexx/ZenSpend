
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

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
        <main className={cn("flex-1 pb-20 md:pb-0", isClient && "flex flex-col")}>
          {children}
        </main>
        {isClient && isMobile && <MobileNav />}
      </div>

       <Button
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 h-16 w-16 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add Transaction</span>
      </Button>

      <AddTransactionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </SidebarProvider>
  );
}
