
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Transaction } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/lib/icons.tsx";
import { format, isSameDay, startOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EditTransactionDialog } from "../transactions/client";
import { useToast } from "@/hooks/use-toast";

function DailyTransactionsSheet({
  selectedDay,
  onOpenChange,
  onEditTransaction,
}: {
  selectedDay: Date | null;
  onOpenChange: (open: boolean) => void;
  onEditTransaction: (transaction: Transaction) => void;
}) {
  const { transactions, categoryIcons } = useZenStore();

  const dailyTransactions = React.useMemo(() => {
    if (!selectedDay) return [];
    return transactions.filter((t) => isSameDay(new Date(t.date), selectedDay));
  }, [transactions, selectedDay]);

  return (
    <Sheet open={!!selectedDay} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            Transactions for {selectedDay ? format(selectedDay, "PPP") : ""}
          </SheetTitle>
          <SheetDescription>
            You made {dailyTransactions.length} transaction
            {dailyTransactions.length !== 1 && "s"} on this day.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] mt-4">
          {dailyTransactions.length > 0 ? (
            <div className="space-y-3 pr-4">
              {dailyTransactions.map((t) => (
                <button
                  key={t.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors flex items-center justify-between"
                  onClick={() => onEditTransaction(t)}
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
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No transactions for this day.</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function CalendarClient() {
  const { transactions, isInitialized, updateTransaction } = useZenStore();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);

  const { toast } = useToast();

  const dailyTotals = React.useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach((t) => {
      const day = format(new Date(t.date), "yyyy-MM-dd");
      totals.set(day, (totals.get(day) || 0) + t.amount);
    });
    return totals;
  }, [transactions]);

  const maxSpending = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const monthTotals = transactions
        .filter(t => isSameDay(new Date(t.date), start) || new Date(t.date) > start)
        .map(t => t.amount);

    return monthTotals.length > 0 ? Math.max(...monthTotals) : 0;
  }, [transactions, currentMonth]);


  const getSpendingLevel = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");
    const total = dailyTotals.get(dayString);
    if (!total || total <= 0) return 0;
    if (maxSpending <= 0) return 1;

    const percentage = (total / maxSpending) * 100;
    if (percentage < 20) return 1;
    if (percentage < 40) return 2;
    if (percentage < 60) return 3;
    if (percentage < 80) return 4;
    return 5;
  };
  
  const modifiers = Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => i + 1).map((level) => [
      `spending-${level}`,
      (day: Date) => getSpendingLevel(day) === level,
    ])
  );
  
  const modifierClassNames = Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => i + 1).map((level) => [
      `spending-${level}`,
      `bg-primary/${level * 20} text-primary-foreground`,
    ])
  );

  const handleEditConfirm = (transactionId: string, updates: Partial<Transaction>) => {
    updateTransaction(transactionId, updates);
    toast({
        title: "Transaction Updated",
        description: `Your changes to "${updates.description}" have been saved.`,
    });
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
            Visualize your daily spending. Darker days mean more spending.
            Click a day to see its transactions.
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
      </Card>
      <DailyTransactionsSheet
        selectedDay={selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        onEditTransaction={(t) => {
            setEditingTransaction(t);
            setSelectedDay(null); // Close sheet to open dialog
        }}
      />
      
      <EditTransactionDialog 
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onConfirm={handleEditConfirm}
        transaction={editingTransaction}
      />
    </div>
  );
}
