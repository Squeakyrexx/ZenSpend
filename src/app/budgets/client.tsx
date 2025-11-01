
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import { CATEGORY_ICONS } from "@/lib/data";
import type { Category } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { NumpadDialog } from "@/components/ui/numpad-dialog";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

function BudgetCard({
  category,
  spent,
  limit,
  onUpdateLimit,
}: {
  category: Category;
  spent: number;
  limit: number;
  onUpdateLimit: (category: Category, newLimit: number) => void;
}) {
  const [isNumpadOpen, setIsNumpadOpen] = React.useState(false);
  const { toast } = useToast();
  const progress = limit > 0 ? (spent / limit) * 100 : 0;

  const handleUpdate = (newLimit: number) => {
    if (newLimit > 0) {
      onUpdateLimit(category, newLimit);
      toast({
        title: "Budget Updated",
        description: `Your budget for ${category} is now $${newLimit.toFixed(2)}.`,
      });
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: `Please enter a number greater than zero.`,
        });
    }
    setIsNumpadOpen(false);
  };

  const getProgressColor = () => {
    if (progress > 100) return "bg-red-500";
    if (progress >= 80) return "bg-yellow-500";
    return "bg-primary";
  }

  return (
    <>
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
            {category}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-lg">${spent.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">
                of ${limit.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={progress > 100 ? 100 : progress} 
              className="h-3"
              indicatorClassName={getProgressColor()}
            />
            <p className={cn(
                "text-right text-sm mt-1 font-medium",
                spent > limit && "text-red-500"
            )}>
              {spent > limit 
                ? `$${(spent - limit).toFixed(2)} over` 
                : `$${(limit - spent).toFixed(2)} remaining`
              }
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsNumpadOpen(true)}>
             <Pencil className="mr-2 h-4 w-4" /> Edit Limit
          </Button>
        </CardContent>
      </Card>
      <NumpadDialog
        open={isNumpadOpen}
        onOpenChange={setIsNumpadOpen}
        onConfirm={handleUpdate}
        initialValue={limit}
        title={`Set budget for ${category}`}
        description="Enter the new budget limit for this category."
      />
    </>
  );
}

export function BudgetsClient() {
  const { budgets, updateBudgetLimit, isInitialized } = useZenStore();

  const totalBudget = React.useMemo(() => budgets.reduce((sum, b) => sum + b.limit, 0), [budgets]);
  const totalSpent = React.useMemo(() => budgets.reduce((sum, b) => sum + b.spent, 0), [budgets]);
  
  if (!isInitialized) {
    return (
       <div className="p-4 md:p-8">
        <Card className="mb-6">
          <CardHeader>
             <Skeleton className="h-8 w-1/3" />
             <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-9 w-full" />
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budgets</CardTitle>
          <CardDescription>
            You've spent ${totalSpent.toFixed(2)} of your ${totalBudget.toFixed(2)} total budget this month.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.category}
            {...budget}
            onUpdateLimit={updateBudgetLimit}
          />
        ))}
      </div>
    </div>
  );
}
