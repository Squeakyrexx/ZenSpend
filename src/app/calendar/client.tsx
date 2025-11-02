
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Transaction, RecurringPayment, Category } from "@/lib/types";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/lib/icons.tsx";
import { format, isSameDay, startOfMonth, isFuture, isToday, isSameMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
  filteredTransactions,
}: {
  selectedDay: Date | null;
  onOpenChange: (open: boolean) => void;
  onViewTransaction: (transaction: Transaction) => void;
  filteredTransactions: Transaction[];
}) {
  const { categoryIcons, recurringPayments } = useZenStore();

  const dailyTransactions = React.useMemo(() => {
    if (!selectedDay) return [];
    return filteredTransactions.filter((t) => isSameDay(new Date(t.date), selectedDay));
  }, [filteredTransactions, selectedDay]);

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

const countLegend = [
  { label: '1', color: 'bg-blue-300/60', text: 'text-blue-900 dark:text-blue-100' },
  { label: '2', color: 'bg-green-300/60', text: 'text-green-900 dark:text-green-100' },
  { label: '3', color: 'bg-orange-300/60', text: 'text-orange-900 dark:text-orange-100' },
  { label: '4', color: 'bg-pink-300/60', text: 'text-pink-900 dark:text-pink-100' },
  { label: '5+', color: 'bg-red-300/60', text: 'text-red-900 dark:text-white font-bold' },
];

const amountLegend = [
    { label: '< $50', color: 'bg-sky-200/60', text: 'text-sky-900 dark:text-sky-100' },
    { label: '$50+', color: 'bg-teal-300/60', text: 'text-teal-900 dark:text-teal-100' },
    { label: '$100+', color: 'bg-yellow-300/60', text: 'text-yellow-900 dark:text-yellow-100' },
    { label: '$250+', color: 'bg-orange-400/60', text: 'text-orange-900 dark:text-orange-100' },
    { label: '$500+', color: 'bg-red-400/60', text: 'text-red-900 dark:text-white font-bold' },
];


export function CalendarClient() {
  const { transactions, isInitialized, recurringPayments, categories } = useZenStore();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [viewingTransaction, setViewingTransaction] = React.useState<Transaction | null>(null);
  const [viewMode, setViewMode] = React.useState<"count" | "amount">("count");
  const [selectedCategories, setSelectedCategories] = React.useState<Record<Category, boolean>>(
    () => Object.fromEntries(categories.map(c => [c, true]))
  );

  React.useEffect(() => {
    setSelectedCategories(Object.fromEntries(categories.map(c => [c, true])));
  }, [categories]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(t => selectedCategories[t.category]);
  }, [transactions, selectedCategories]);


  const dailyMetrics = React.useMemo(() => {
    const metrics = new Map<string, { count: number; amount: number }>();
    filteredTransactions.forEach((t) => {
      const day = format(new Date(t.date), "yyyy-MM-dd");
      const existing = metrics.get(day) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += t.amount;
      metrics.set(day, existing);
    });
    return metrics;
  }, [filteredTransactions]);

  
  const upcomingPaymentDates = React.useMemo(() => {
    return recurringPayments.map(p => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), p.dayOfMonth);
        if (isSameMonth(date, currentMonth) && (isFuture(date) || isToday(date))) {
            return date;
        }
        return null;
    }).filter((d): d is Date => d !== null);
  }, [recurringPayments, currentMonth]);

  const legendItems = viewMode === 'count' ? countLegend : amountLegend;

  const getLevel = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");
    const metric = dailyMetrics.get(dayString);
    if (!metric) return 0;

    const boundaries = viewMode === 'count' 
      ? [1, 2, 3, 4, Infinity] // levels for count
      : [50, 100, 250, 500, Infinity]; // levels for amount
    
    const value = viewMode === 'count' ? metric.count : metric.amount;

    if (value <= 0) return 0;
    
    // Find the index of the first boundary the value is less than or equal to.
    const levelIndex = boundaries.findIndex(boundary => value <= boundary);
    
    // The level is the index + 1. If not found, it's the highest level.
    return levelIndex !== -1 ? levelIndex + 1 : boundaries.length;
  };
  
  const modifiers = {
    ...Object.fromEntries(
      Array.from({ length: legendItems.length }, (_, i) => i + 1).map((level) => [
        `level-${level}`,
        (day: Date) => getLevel(day) === level,
      ])
    ),
    recurring: (day: Date) => upcomingPaymentDates.some(d => isSameDay(d, day))
  };
  
  const modifierClassNames = {
    ...Object.fromEntries(
        legendItems.map((item, index) => [
            `level-${index + 1}`,
            `${item.color} ${item.text}`
        ])
    ),
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
            Visualize daily spending by amount or transaction count. Filter by category and click a day for details.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
           <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "count" | "amount")} className="w-full sm:w-auto">
                <TabsList>
                    <TabsTrigger value="count">By Transaction Count</TabsTrigger>
                    <TabsTrigger value="amount">By Spending Amount</TabsTrigger>
                </TabsList>
            </Tabs>

             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filter Categories
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Show Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-48">
                        {categories.map((category) => (
                        <DropdownMenuCheckboxItem
                            key={category}
                            checked={selectedCategories[category] ?? false}
                            onCheckedChange={(checked) => {
                                setSelectedCategories(prev => ({ ...prev, [category]: !!checked }));
                            }}
                        >
                            {category}
                        </DropdownMenuCheckboxItem>
                        ))}
                    </ScrollArea>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardContent>
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
         <CardFooter className="flex-col items-start gap-3 text-sm">
            <p className="font-medium">Legend</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary" />
                    <span>Upcoming Bill</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{viewMode === 'count' ? "Transactions:" : "Amount Spent:"}</span>
                    {legendItems.map(item => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <span className={`h-4 w-4 rounded-sm ${item.color}`}></span>
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
        filteredTransactions={filteredTransactions}
      />
      
      <TransactionDetailsDialog 
        open={!!viewingTransaction}
        onOpenChange={(open) => !open && setViewingTransaction(null)}
        transaction={viewingTransaction}
      />
    </div>
  );
}

    