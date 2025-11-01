
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Category, Budget } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { NumpadDialog } from "@/components/ui/numpad-dialog";
import { Pencil, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

function BudgetCard({
  budget,
  onUpdateLimit,
}: {
  budget: Budget;
  onUpdateLimit: (category: Category, newLimit: number) => void;
}) {
  const [isNumpadOpen, setIsNumpadOpen] = React.useState(false);
  const { toast } = useToast();
  const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

  const handleUpdate = (newLimit: number) => {
    if (newLimit > 0) {
      onUpdateLimit(budget.category, newLimit);
      toast({
        title: "Budget Updated",
        description: `Your budget for ${budget.category} is now $${newLimit.toFixed(2)}.`,
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
            <span className="text-2xl">{budget.icon}</span>
            {budget.category}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-lg">${budget.spent.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">
                of ${budget.limit.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={progress > 100 ? 100 : progress} 
              className="h-3"
              indicatorClassName={getProgressColor()}
            />
            <p className={cn(
                "text-right text-sm mt-1 font-medium",
                budget.spent > budget.limit && "text-red-500"
            )}>
              {budget.spent > budget.limit 
                ? `$${(budget.spent - budget.limit).toFixed(2)} over` 
                : `$${(budget.limit - budget.spent).toFixed(2)} remaining`
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
        initialValue={budget.limit}
        title={`Set budget for ${budget.category}`}
        description="Enter the new budget limit for this category."
      />
    </>
  );
}

function AddCategoryDialog({
    open,
    onOpenChange,
    onAddCategory,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddCategory: (name: string, icon: string, limit: number) => void;
}) {
    const [name, setName] = React.useState("");
    const [icon, setIcon] = React.useState("");
    const [limit, setLimit] = React.useState(0);
    const [isNumpadOpen, setIsNumpadOpen] = React.useState(false);
    const { toast } = useToast();

    const handleConfirmLimit = (newLimit: number) => {
        if (newLimit > 0) {
            setLimit(newLimit);
        } else {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: `Please enter a number greater than zero.`,
            });
        }
        setIsNumpadOpen(false);
    };

    const handleSubmit = () => {
        if (!name.trim() || !icon.trim() || limit <= 0) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all fields with a valid budget limit.",
            });
            return;
        }
        onAddCategory(name, icon, limit);
        onOpenChange(false);
        setName("");
        setIcon("");
        setLimit(0);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Create a custom budget category for your expenses.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="category-name">Category Name</Label>
                            <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hobbies" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category-icon">Icon (Emoji)</Label>
                            <Input id="category-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. 🎨" maxLength={2} />
                        </div>
                        <div className="space-y-2">
                            <Label>Budget Limit</Label>
                            <Button variant="outline" className="w-full justify-start font-normal" onClick={() => setIsNumpadOpen(true)}>
                                {limit > 0 ? `$${limit.toFixed(2)}` : "Set Budget Limit"}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSubmit}>Add Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <NumpadDialog
                open={isNumpadOpen}
                onOpenChange={setIsNumpadOpen}
                onConfirm={handleConfirmLimit}
                initialValue={limit}
                title="Set Budget Limit"
                description="Enter the budget limit for your new category."
            />
        </>
    );
}


export function BudgetsClient() {
  const { budgets, updateBudgetLimit, addCategory, isInitialized } = useZenStore();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const { toast } = useToast();

  const totalBudget = React.useMemo(() => budgets.reduce((sum, b) => sum + b.limit, 0), [budgets]);
  const totalSpent = React.useMemo(() => budgets.reduce((sum, b) => sum + b.spent, 0), [budgets]);
  
  const handleAddCategory = (name: string, icon: string, limit: number) => {
      if (budgets.find(b => b.category.toLowerCase() === name.toLowerCase())) {
          toast({
              variant: "destructive",
              title: "Category Exists",
              description: `A category named "${name}" already exists.`,
          });
          return;
      }
      addCategory(name, icon, limit);
      toast({
          title: "Category Added",
          description: `The "${name}" category has been added to your budgets.`,
      });
  };

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
            budget={budget}
            onUpdateLimit={updateBudgetLimit}
          />
        ))}
         <Card className="border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
            <CardHeader className="text-center">
                <Button variant="ghost" className="w-full h-full text-lg" onClick={() => setIsAddCategoryOpen(true)}>
                    <PlusCircle className="mr-2 h-6 w-6"/>
                    Add Category
                </Button>
            </CardHeader>
        </Card>
      </div>
       <AddCategoryDialog 
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}
