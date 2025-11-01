"use client";

import * as React from "react";
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

  if (!isInitialized) {
     return (
       <div className="p-4 md:p-8">
         <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
         </Card>
       </div>
     )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Spending Insights</CardTitle>
          <CardDescription>
            Let AI analyze your spending and provide helpful tips. Generate a new report at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateInsights} disabled={isLoading || transactions.length === 0}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate New Insights
              </>
            )}
          </Button>

          {isLoading && (
            <div className="mt-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                    <Skeleton className="h-5 w-4/5" />
                </div>
              ))}
            </div>
          )}

          {insights.length > 0 && !isLoading && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold">Your Latest Insights Report</h3>
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                    <p>{insight}</p>
                </div>
              ))}
            </div>
          )}

          {transactions.length > 0 && insights.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-lg font-semibold">Ready for your insights?</p>
              <p className="text-muted-foreground">
                Click the button to generate your AI-powered spending report.
              </p>
            </div>
          )}

          {transactions.length === 0 && (
             <div className="text-center py-12">
              <p className="text-lg font-semibold">No data to analyze.</p>
              <p className="text-muted-foreground">
                Add some transactions to get started with AI insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
