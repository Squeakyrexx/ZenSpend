"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/lib/icons.tsx";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isPast, addMonths } from "date-fns";

export function DashboardClient() {
  const { transactions, recurringPayments, isInitialized, categoryIcons } = useZenStore();

  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);
  
  const upcomingPayments = React.useMemo(() => {
    const today = new Date();
    return recurringPayments
      .map(p => {
        const thisMonthDueDate = new Date(today.getFullYear(), today.getMonth(), p.dayOfMonth);
        const nextMonthDueDate = addMonths(thisMonthDueDate, 1);
        const dueDate = isPast(thisMonthDueDate) ? nextMonthDueDate : thisMonthDueDate;
        const daysUntilDue = differenceInDays(dueDate, today);
        return { ...p, dueDate, daysUntilDue };
      })
      .filter(p => p.daysUntilDue >= 0)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 5);
  }, [recurringPayments]);


  if (!isInitialized) {
    return (
       <div className="p-4 md:p-8 space-y-6">
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/3" />
             <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
            <div>
                 <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            </div>
             <div>
                 <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-4xl">Welcome Back!</CardTitle>
                <CardDescription>Here's a quick overview of your financial world.</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Upcoming Payments</h2>
                 {upcomingPayments.length > 0 ? (
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            {upcomingPayments.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary">
                                    <div className="flex items-center gap-3">
                                        <Icon name={p.icon} className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{p.description}</p>
                                            <p className="text-sm text-muted-foreground">${p.amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{p.daysUntilDue === 0 ? "Today" : `${p.daysUntilDue} day${p.daysUntilDue > 1 ? 's' : ''}`}</p>
                                        <p className="text-sm text-muted-foreground">{format(p.dueDate, "MMM do")}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                 ) : (
                    <Card className="flex items-center justify-center py-10">
                        <p className="text-muted-foreground">No upcoming payments found.</p>
                    </Card>
                 )}
            </div>
             <div className="space-y-4">
                <h2 className="text-2xl font-bold">Recent Transactions</h2>
                 {recentTransactions.length > 0 ? (
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            {recentTransactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary">
                                    <div className="flex items-center gap-3">
                                        <Icon name={categoryIcons[t.category] || t.icon} className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{t.description}</p>
                                            <p className="text-sm text-muted-foreground">{t.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${t.amount.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">{format(new Date(t.date), "MMM d")}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                 ) : (
                     <Card className="flex items-center justify-center py-10">
                        <p className="text-muted-foreground">No recent transactions to show.</p>
                    </Card>
                 )}
            </div>
        </div>
    </div>
  )
}
