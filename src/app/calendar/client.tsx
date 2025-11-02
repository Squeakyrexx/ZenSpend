
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Transaction, RecurringPayment } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/lib/icons.tsx";
import { format, isSameDay, startOfMonth, isFuture, isToday, isSameMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


function TransactionDetailsDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
    if (!transaction) return null;

    const { categoryIcons } = useZenStore();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                    <DialogDescription>
                        A read-only view of your transaction.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                        <Icon name={categoryIcons[transaction.category] || transaction.icon} className="h-10 w-10 text-primary" />
                        <div>
                            <p className="font-bold text-xl">{transaction.description}</p>
                            <p className="text-2xl font-bold">${transaction.amount.toFixed(2)}</p>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Category</p>
                            <p className="font-medium flex items-center gap-2">
                                <Badge variant="secondary">{transaction.category}</Badge>
                            </p>
                        </div>
                         <div className="space-y-1">
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">{format(new Date(transaction.date), 'PPP')}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


function DailyTransactionsSheet({
  selectedDay,
  onOpenChange,
  onViewTransaction,
}: {
  selectedDay: Date | null;
  onOpenChange: (open: boolean) => void;
  onViewTransaction: (transaction: Transaction) => void;
}) {
  const { transactions, categoryIcons, recurringPayments } = useZenStore();

  const dailyTransactions = React.useMemo(() => {
    if (!selectedDay) return [];
    return transactions.filter((t) => isSameDay(new Date(t.date), selectedDay));
  }, [transactions, selectedDay]);

  const upcomingBills = React.useMemo(() => {
    if (!selectedDay || !(isFuture(selectedDay) || isToday(selectedDay))) return [];
    return recurringPayments.filter(p => {
        const dueDate = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), p.dayOfMonth);
        return isSameDay(dueDate, selectedDay);
    });
  }, [recurringPayments, selectedDay]);


  return (
    <Sheet open={!!selectedDay} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            Details for {selectedDay ? format(selectedDay, "PPP") : ""}
          </SheetTitle>
          <SheetDescription>
            A summary of your financial activity for this day.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] mt-4">
          <div className="space-y-4 pr-4">
            {dailyTransactions.length > 0 && (
                <div>
                    <h3 className="mb-2 font-semibold">Completed Transactions</h3>
                    <div className="space-y-3">
                    {dailyTransactions.map((t) => (
                        <button
                        key={t.id}
                        className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors flex items-center justify-between"
                        onClick={() => onViewTransaction(t)}
                        >
                        <div className="flex items-center gap-3">
                            <Icon
                            name={categoryIcons[t.category] || t.icon}
                            className="h-6 w-6 text-muted-foreground"
                            />
                            <div>
                            <p className="font-semibold">{t.description}</p>
                            <p className="text-sm">
                                <Badge variant="secondary">{t.category}</Badge>
                            </p>
                            </div>
                        </div>
                        <p className="font-bold text-lg">${t.amount.toFixed(2)}</p>
                        </button>
                    ))}
                    </div>
                </div>
            )}

            {upcomingBills.length > 0 && (
                 <div>
                    <h3 className="mb-2 font-semibold">Upcoming Bills</h3>
                    <div className="space-y-3">
                    {upcomingBills.map((p) => (
                        <div
                        key={p.id}
                        className="w-full text-left p-3 rounded-lg bg-secondary/30 flex items-center justify-between"
                        >
                        <div className="flex items-center gap-3">
                            <Icon
                            name={p.icon}
                            className="h-6 w-6 text-muted-foreground"
                            />
                            <div>
                            <p className="font-semibold">{p.description}</p>
                            <p className="text-sm">
                                <Badge variant="outline">{p.category}</Badge>
                            </p>
                            </div>
                        </div>
                        <p className="font-bold text-lg">${p.amount.toFixed(2)}</p>
                        </div>
                    ))}
                    </div>
                </div>
            )}

            {dailyTransactions.length === 0 && upcomingBills.length === 0 && (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <p>No activity for this day.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

const legendItems = [
  { label: '1', className: 'bg-blue-300/60' },
  { label: '2', className: 'bg-green-300/60' },
  { label: '3', className: 'bg-orange-300/60' },
  { label: '4', className: 'bg-pink-300/60' },
  { label: '5+', className: 'bg-red-300/60' },
];

export function CalendarClient() {
  const { transactions, isInitialized, recurringPayments } = useZenStore();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [viewingTransaction, setViewingTransaction] = React.useState<Transaction | null>(null);


  const dailyTransactionCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    transactions.forEach((t) => {
      const day = format(new Date(t.date), "yyyy-MM-dd");
      counts.set(day, (counts.get(day) || 0) + 1);
    });
    return counts;
  }, [transactions]);
  
  const upcomingPaymentDates = React.useMemo(() => {
    return recurringPayments.map(p => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), p.dayOfMonth);
        // Ensure we only mark future or today's bills that are in the currently viewed month
        if (isSameMonth(date, currentMonth) && (isFuture(date) || isToday(date))) {
            return date;
        }
        return null;
    }).filter((d): d is Date => d !== null);
  }, [recurringPayments, currentMonth]);


  const getTransactionCountLevel = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");
    const count = dailyTransactionCounts.get(dayString);
    if (!count || count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    if (count === 4) return 4;
    return 5;
  };
  
  const modifiers = {
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => i + 1).map((level) => [
        `count-${level}`,
        (day: Date) => getTransactionCountLevel(day) === level,
      ])
    ),
    recurring: (day: Date) => upcomingPaymentDates.some(d => isSameDay(d, day))
  };
  
  const modifierClassNames = {
    'count-1': 'bg-blue-300/60 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100',
    'count-2': 'bg-green-300/60 text-green-900 dark:bg-green-800/40 dark:text-green-100',
    'count-3': 'bg-orange-300/60 text-orange-900 dark:bg-orange-800/40 dark:text-orange-100',
    'count-4': 'bg-pink-300/60 text-pink-900 dark:bg-pink-800/40 dark:text-pink-100',
    'count-5': 'bg-red-300/60 text-red-900 dark:bg-red-800/40 dark:text-white font-bold',
    recurring: 'relative before:content-[""] before:absolute before:bottom-1.5 before:left-1/2 before:-translate-x-1/2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary'
  };

  if (!isInitialized) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
        <Card>
            <CardContent className="p-2 md:p-6">
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spending Calendar</CardTitle>
          <CardDescription>
            Visualize your daily transaction frequency. Colors indicate more transactions. Dots indicate upcoming bills.
            Click a day to see its details.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-2 md:p-6 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDay || undefined}
            onSelect={(day) => setSelectedDay(day || null)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersClassNames={modifierClassNames}
            className="w-full max-w-2xl"
          />
        </CardContent>
         <CardFooter className="flex-col items-start gap-2 text-sm">
            <p className="font-medium">Legend</p>
            <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary" />
                    <span>Upcoming Bill</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Transactions:</span>
                    {legendItems.map(item => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <span className={`h-4 w-4 rounded-sm ${item.className}`}></span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </CardFooter>
      </Card>
      <DailyTransactionsSheet
        selectedDay={selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        onViewTransaction={(t) => {
            setViewingTransaction(t);
            setSelectedDay(null); // Close sheet to open dialog
        }}
      />
      
      <TransactionDetailsDialog 
        open={!!viewingTransaction}
        onOpenChange={(open) => !open && setViewingTransaction(null)}
        transaction={viewingTransaction}
      />
    </div>
  );
}
