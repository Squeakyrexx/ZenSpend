"use client";

import * as React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useZenStore } from "@/hooks/use-zen-store";
import { getInsights } from "../actions";
import { Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export function InsightsClient() {
  const { transactions, isInitialized } = useZenStore();
  const [insights, setInsights] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setInsights([]);
    const result = await getInsights(transactions);
    if (result && !("error" in result)) {
      setInsights(result.insights);
    }
    setIsLoading(false);
  };

  const spendingByCategory = React.useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    transactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  if (!isInitialized) {
     return (
       <div className="p-4 md:p-8 grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
         </Card>
         <Card>
             <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
             <CardContent><Skeleton className="h-64 w-full" /></CardContent>
         </Card>
       </div>
     )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
          <CardDescription>
            Let AI analyze your spending and provide helpful tips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateInsights} disabled={isLoading || transactions.length === 0}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Insights
              </>
            )}
          </Button>

          {insights.length > 0 && (
            <div className="mt-6 space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                    <p>{insight}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Breakdown</CardTitle>
          <CardDescription>
            A look at where your money is going this month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={spendingByCategory}>
                 <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip 
                    cursor={false}
                    content={<ChartTooltipContent />} 
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              </BarChart>
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
  );
}
