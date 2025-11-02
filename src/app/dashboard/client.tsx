
'use client';

import * as React from 'react';
import { useZenStore } from '@/hooks/use-zen-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/lib/icons.tsx';
import { format, differenceInDays, isPast, addMonths, subMonths, startOfMonth, eachDayOfInterval, startOfToday } from 'date-fns';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { getInsights } from '../actions';
import { Loader2, Sparkles, ArrowDown, ArrowUp, ArrowRight, BellRing } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const chartConfig = {
  total: {
    label: 'Spending',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


function MonthlySummaryCard({ income, expenses }: { income: number; expenses: number }) {
    const netFlow = income - expenses;
    const isPositive = netFlow >= 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Monthly Summary</CardTitle>
                <CardDescription>Your income vs. expenses this month.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold text-green-500">${income.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-500">${expenses.toFixed(2)}</p>
                </div>
                <div className="border-t pt-4">
                     <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                    <div className={cn("flex items-center gap-2 text-2xl font-bold", isPositive ? "text-green-500" : "text-red-500")}>
                        {isPositive ? <ArrowUp className="h-5 w-5"/> : <ArrowDown className="h-5 w-5"/>}
                        <span>${Math.abs(netFlow).toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function UpcomingBillReminder({ upcomingPayments }: { upcomingPayments: any[] }) {
    const reminderPayments = upcomingPayments.filter(p => p.daysUntilDue <= 7);

    if (reminderPayments.length === 0) {
        return null;
    }

    const payment = reminderPayments[0]; // Show the most imminent bill

    return (
        <Card className="bg-secondary/30 border-primary/20">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <BellRing className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-lg">Heads Up!</h3>
                        <p className="text-muted-foreground">
                            Your <span className="font-semibold text-foreground">{payment.description}</span> bill of <span className="font-semibold text-foreground">${payment.amount.toFixed(2)}</span> is due {payment.daysUntilDue === 0 ? 'today' : `in ${payment.daysUntilDue} day${payment.daysUntilDue > 1 ? 's' : ''}`}.
                        </p>
                    </div>
                     <Button asChild size="sm" className="ml-auto">
                        <Link href="/recurring">View All</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


export function DashboardClient() {
  const { transactions, recurringPayments, budgets, isInitialized, categoryIcons, calculateMonthlyIncome, calculateMonthlyExpenses } =
    useZenStore();
  const [insights, setInsights] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setInsights([]);
    const result = await getInsights(transactions);
    if (result && !('error' in result)) {
      setInsights(result.insights);
    }
    setIsLoading(false);
  };

  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const upcomingPayments = React.useMemo(() => {
    const today = new Date();
    return recurringPayments
      .map((p) => {
        const thisMonthDueDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          p.dayOfMonth
        );
        const nextMonthDueDate = addMonths(thisMonthDueDate, 1);
        const dueDate = isPast(thisMonthDueDate)
          ? nextMonthDueDate
          : thisMonthDueDate;
        const daysUntilDue = differenceInDays(dueDate, today);
        return { ...p, dueDate, daysUntilDue };
      })
      .filter((p) => p.daysUntilDue >= 0)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 3);
  }, [recurringPayments]);

  const topBudgets = React.useMemo(() => {
    return [...budgets]
        .sort((a,b) => (b.spent / b.limit) - (a.spent / a.limit))
        .slice(0, 3);
  }, [budgets]);

  const dailySpending = React.useMemo(() => {
    const today = startOfToday();
    const last30Days = eachDayOfInterval({
      start: subMonths(today, 1),
      end: today
    });

    const spendingMap = new Map(last30Days.map(day => [format(day, 'yyyy-MM-dd'), 0]));

    transactions.forEach(t => {
      const transactionDate = format(new Date(t.date), 'yyyy-MM-dd');
      if (spendingMap.has(transactionDate)) {
        spendingMap.set(transactionDate, (spendingMap.get(transactionDate) || 0) + t.amount);
      }
    });
    
    return Array.from(spendingMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

    const { monthlyIncome, monthlyExpenses } = React.useMemo(() => {
    const income = calculateMonthlyIncome();
    const expenses = calculateMonthlyExpenses();

    return { monthlyIncome: income, monthlyExpenses: expenses };
  }, [transactions, recurringPayments, calculateMonthlyIncome, calculateMonthlyExpenses]);
  
  const getProgressColor = (progress: number) => {
    if (progress > 100) return "bg-red-500";
    if (progress >= 80) return "bg-yellow-500";
    return "bg-primary";
  }


  if (!isInitialized) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">Welcome Back!</CardTitle>
          <CardDescription>
            Here's a quick overview of your financial world.
          </CardDescription>
        </CardHeader>
      </Card>

      <UpcomingBillReminder upcomingPayments={upcomingPayments} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MonthlySummaryCard income={monthlyIncome} expenses={monthlyExpenses} />
        {topBudgets.map(budget => {
            const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            return (
                <Card key={budget.category} className="hover:border-primary/50 transition-colors">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Icon name={budget.icon} className="h-6 w-6" />
                            {budget.category}
                        </CardTitle>
                     </CardHeader>
                    <CardContent>
                         <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-lg">${budget.spent.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">
                                of ${budget.limit.toFixed(2)}
                            </span>
                        </div>
                        <Progress 
                            value={progress > 100 ? 100 : progress} 
                            className="h-2"
                            indicatorClassName={getProgressColor(progress)}
                        />
                         <p className={cn(
                            "text-right text-xs mt-1 font-medium",
                            budget.spent > budget.limit && "text-red-500"
                        )}>
                        {budget.spent > budget.limit 
                            ? `$${(budget.spent - budget.limit).toFixed(2)} over` 
                            : `$${(budget.limit - budget.spent).toFixed(2)} remaining`
                        }
                        </p>
                    </CardContent>
                </Card>
            )
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
            <h2 className="text-2xl font-bold">Cash Flow (Last 30 Days)</h2>
            <Card>
                <CardContent className="p-4">
                     {transactions.length > 0 ? (
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                           <AreaChart
                              accessibilityLayer
                              data={dailySpending}
                              margin={{
                                left: 0,
                                right: 12,
                                top: 10,
                                bottom: 0,
                              }}
                            >
                             <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                              <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                              />
                              <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => format(new Date(value), 'MMM d')}
                              />
                              <ChartTooltip
                                cursor={true}
                                content={<ChartTooltipContent 
                                    labelFormatter={(label) => format(new Date(label), 'PPP')}
                                    indicator="dot" 
                                />}
                              />
                              <Area
                                dataKey="total"
                                type="monotone"
                                fill="url(#colorTotal)"
                                stroke="var(--color-total)"
                                stackId="a"
                              />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <div className="text-center py-12">
                        <p className="text-lg font-semibold">No chart data.</p>
                        <p className="text-muted-foreground">
                            Add some transactions to see your spending breakdown.
                        </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2 space-y-4">
             <h2 className="text-2xl font-bold">AI Insights</h2>
             <Card>
                <CardContent className="p-4">
                     <Button onClick={handleGenerateInsights} disabled={isLoading || transactions.length === 0} className="w-full">
                        {isLoading ? (
                        <Loader2 className="animate-spin" />
                        ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" /> Generate Insights
                        </>
                        )}
                    </Button>

                    {insights.length > 0 && (
                        <div className="mt-4 space-y-2">
                        {insights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg text-sm">
                                <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0"/>
                                <p>{insight}</p>
                            </div>
                        ))}
                        </div>
                    )}
                     {transactions.length > 0 && insights.length === 0 && !isLoading && (
                         <div className="text-center py-8">
                            <p className="text-muted-foreground">Click the button to get AI-powered insights.</p>
                         </div>
                     )}
                     {transactions.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">Add some transactions to generate insights.</p>
                         </div>
                     )}
                </CardContent>
             </Card>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Payments</h2>
            <Button variant="link" asChild><Link href="/recurring">View All</Link></Button>
          </div>
          {upcomingPayments.length > 0 ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {upcomingPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name={p.icon}
                        className="h-6 w-6 text-muted-foreground"
                      />
                      <div>
                        <p className="font-semibold">{p.description}</p>
                        <p className="text-sm text-muted-foreground">
                          ${p.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {p.daysUntilDue === 0
                          ? 'Today'
                          : `${p.daysUntilDue} day${p.daysUntilDue > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(p.dueDate, 'MMM do')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center py-10">
              <p className="text-muted-foreground">
                No upcoming payments found.
              </p>
            </Card>
          )}
        </div>
        <div className="space-y-4">
           <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recent Transactions</h2>
                <Button variant="link" asChild><Link href="/transactions">View All</Link></Button>
           </div>
          {recentTransactions.length > 0 ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name={categoryIcons[t.category] || t.icon}
                        className="h-6 w-6 text-muted-foreground"
                      />
                      <div>
                        <p className="font-semibold">{t.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${t.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(t.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center py-10">
              <p className="text-muted-foreground">
                No recent transactions to show.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
