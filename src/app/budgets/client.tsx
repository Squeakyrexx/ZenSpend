
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Category, Budget } from "@/lib/types";
import { getBudgetSuggestions } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { NumpadDialog } from "@/components/ui/numpad-dialog";
import { Pencil, PlusCircle, Trash2, Sparkles, Loader2, Check, X, Wand2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@/lib/icons.tsx";
import { ICONS } from "@/lib/icons.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

const COLOR_SWATCHES = [
    "hsl(220 70% 60%)", "hsl(160 60% 55%)", "hsl(340 70% 65%)", "hsl(40 70% 60%)", "hsl(280 60% 65%)",
    "hsl(10 60% 50%)", "hsl(190 70% 55%)", "hsl(300 50% 60%)", "hsl(80 55% 60%)", "hsl(250 65% 70%)"
];


function BudgetCard({
  budget,
  onUpdateLimit,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  onUpdateLimit: (category: Category, newLimit: number) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (category: Category) => void;
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

  return (
    <>
      <Card className="hover:border-primary/50 transition-colors flex flex-col" style={{'--budget-color': budget.color} as React.CSSProperties}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Icon name={budget.icon} className="h-8 w-8 text-[var(--budget-color)]" />
              {budget.category}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => onEdit(budget)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-lg">${budget.spent.toFixed(2)}</span>
              <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsNumpadOpen(true)}>
                of ${budget.limit.toFixed(2)}
              </button>
            </div>
            <Progress 
              value={progress > 100 ? 100 : progress} 
              className="h-3"
              indicatorClassName="bg-[var(--budget-color)]"
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
          <div className="flex gap-2 pt-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the "{budget.category}" category and all of its associated transactions. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(budget.category)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
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

function CategoryDialog({
    open,
    onOpenChange,
    onConfirm,
    budgetToEdit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (data: Omit<Budget, 'spent'>) => void;
    budgetToEdit: Budget | null;
}) {
    const [name, setName] = React.useState("");
    const [selectedIcon, setSelectedIcon] = React.useState<string>("");
    const [selectedColor, setSelectedColor] = React.useState<string>("");
    const [limit, setLimit] = React.useState(0);
    const [isNumpadOpen, setIsNumpadOpen] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (budgetToEdit) {
            setName(budgetToEdit.category);
            setSelectedIcon(budgetToEdit.icon);
            setLimit(budgetToEdit.limit);
            setSelectedColor(budgetToEdit.color);
        } else {
            // Reset for new category
            setName("");
            setSelectedIcon("Landmark");
            setLimit(0);
            setSelectedColor(COLOR_SWATCHES[0]);
        }
    }, [budgetToEdit, open]);

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
        if (!name.trim() || !selectedIcon || limit <= 0 || !selectedColor) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please provide a name, select an icon and color, and set a budget limit.",
            });
            return;
        }
        onConfirm({ category: name, icon: selectedIcon, limit, color: selectedColor });
        onOpenChange(false);
    };

    const isEditing = !!budgetToEdit;
    const dialogTitle = isEditing ? "Edit Category" : "Add New Category";
    const dialogDescription = isEditing 
        ? "Update the details for this category." 
        : "Create a custom budget category for your expenses.";

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <DialogDescription>{dialogDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="category-name">Category Name</Label>
                            <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hobbies" />
                        </div>
                        
                         <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex gap-2 flex-wrap">
                                {COLOR_SWATCHES.map((color) => (
                                    <button
                                        key={color}
                                        className={cn(
                                            "h-8 w-8 rounded-full border-2",
                                            selectedColor === color ? "border-foreground" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Icon</Label>
                             <ScrollArea className="h-32 w-full rounded-md border p-2">
                                <div className="grid grid-cols-6 gap-2">
                                    {ICONS.map((icon) => (
                                        <Button
                                            key={icon}
                                            variant="outline"
                                            className={cn(
                                                "p-2 h-14 w-14 flex items-center justify-center",
                                                selectedIcon === icon && "ring-2 ring-primary border-primary"
                                            )}
                                            onClick={() => setSelectedIcon(icon)}
                                        >
                                            <Icon name={icon} className="h-6 w-6"/>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
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
                        <Button onClick={handleSubmit}>{isEditing ? "Save Changes" : "Add Category"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <NumpadDialog
                open={isNumpadOpen}
                onOpenChange={setIsNumpadOpen}
                onConfirm={handleConfirmLimit}
                initialValue={limit}
                title="Set Budget Limit"
                description={`Enter the budget limit for the ${name} category.`}
            />
        </>
    );
}


function AiBudgetCard() {
  const { budgets, transactions, recurringPayments, calculateMonthlyIncome, setBudgets, categories, categoryIcons } = useZenStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Record<string, number> | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setSuggestions(null);
    const income = calculateMonthlyIncome();

    const result = await getBudgetSuggestions(income, transactions, recurringPayments, categories);
    setIsLoading(false);

    if (result && 'error' in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Suggestions",
        description: result.error,
      });
    } else if (result) {
      setSuggestions(result);
       toast({
        title: "AI Suggestions Ready!",
        description: "Review the suggested budget limits below.",
      });
    }
  };

  const handleApply = () => {
    if (!suggestions) return;
  
    const updatedBudgets = [...budgets];
    const suggestionsToApply = { ...suggestions };
  
    // Update existing budgets
    updatedBudgets.forEach(b => {
      if (suggestionsToApply[b.category]) {
        b.limit = suggestionsToApply[b.category];
        delete suggestionsToApply[b.category]; // Remove from suggestions to avoid re-adding
      }
    });
  
    // Add new budgets for remaining suggestions
    for (const category in suggestionsToApply) {
        // This case should not happen often if suggestions are based on existing categories.
        // If a new category is suggested, we need a default icon and color.
      const newBudget: Budget = {
        category,
        limit: suggestionsToApply[category],
        spent: 0, 
        icon: categoryIcons[category] || 'Landmark', 
        color: 'hsl(220 70% 60%)' // Default color
      };
      updatedBudgets.push(newBudget);
    }
  
    setBudgets(updatedBudgets);
    
    toast({
      title: "Budgets Updated!",
      description: "Your new budget limits have been applied.",
    });
    
    setSuggestions(null);
  };
  
  const handleDismiss = () => {
    setSuggestions(null);
  };
  
  const income = calculateMonthlyIncome();


  return (
    <Card className="lg:col-span-3 bg-gradient-to-br from-card to-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><Wand2 className="text-primary"/>AI Budget Assistant</CardTitle>
          <CardDescription>Let AI analyze your income and spending to suggest a personalized budget.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="font-semibold text-lg">Analyzing your finances...</p>
                    <p className="text-muted-foreground">This may take a moment. The AI is learning your spending habits.</p>
                </div>
            ) : suggestions ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Suggested Monthly Budgets:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(suggestions).map(([category, limit]) => (
                            <div key={category} className="p-4 rounded-lg bg-background/50">
                                <p className="font-medium">{category}</p>
                                <p className="text-2xl font-bold text-primary">${limit.toFixed(0)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center p-8">
                     <h3 className="text-xl font-bold">Ready to build a smarter budget?</h3>
                    {income > 0 ? (
                        <>
                            <p className="text-muted-foreground mt-2 mb-4">Based on your monthly income of ${income.toFixed(2)}, I can create a budget tailored for you.</p>
                            <Button onClick={handleGenerate} disabled={isLoading}>
                                <Sparkles className="mr-2 h-4 w-4" /> Generate Suggestions
                            </Button>
                        </>
                    ) : (
                         <>
                            <p className="text-muted-foreground mt-2 mb-4">Please add your income sources first so the AI can create a budget for you.</p>
                            <Button asChild>
                                <Link href="/income">Add Income</Link>
                            </Button>
                        </>
                    )}
                </div>
            )}
        </CardContent>
        {suggestions && !isLoading && (
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" onClick={handleDismiss}><X className="mr-2"/>Dismiss</Button>
                <Button onClick={handleApply}><Check className="mr-2"/>Apply Suggestions</Button>
            </CardFooter>
        )}
    </Card>
  );
}


export function BudgetsClient() {
  const { budgets, updateBudgetLimit, addCategory, updateCategory, deleteCategory, isInitialized } = useZenStore();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [budgetToEdit, setBudgetToEdit] = React.useState<Budget | null>(null);
  const { toast } = useToast();

  const totalBudget = React.useMemo(() => budgets.reduce((sum, b) => sum + b.limit, 0), [budgets]);
  const totalSpent = React.useMemo(() => budgets.reduce((sum, b) => sum + b.spent, 0), [budgets]);
  
  const handleOpenAddDialog = () => {
    setBudgetToEdit(null);
    setIsCategoryDialogOpen(true);
  }

  const handleOpenEditDialog = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsCategoryDialogOpen(true);
  }
  
  const handleDialogConfirm = (data: Omit<Budget, 'spent'>) => {
      if (budgetToEdit) {
          // Editing existing category
          updateCategory(budgetToEdit.category, data);
          toast({
              title: "Category Updated",
              description: `The "${data.category}" category has been updated.`
          });
      } else {
          // Adding new category
          if (budgets.find(b => b.category.toLowerCase() === data.category.toLowerCase())) {
              toast({
                  variant: "destructive",
                  title: "Category Exists",
                  description: `A category named "${data.category}" already exists.`,
              });
              return;
          }
          addCategory(data.category, data.icon, data.limit, data.color);
          toast({
              title: "Category Added",
              description: `The "${data.category}" category has been added.`,
          });
      }
  };

  const handleDeleteCategory = (category: Category) => {
      deleteCategory(category);
      toast({
          title: "Category Deleted",
          description: `The "${category}" category and its transactions have been deleted.`,
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
      
      <AiBudgetCard />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.category}
            budget={budget}
            onUpdateLimit={updateBudgetLimit}
            onEdit={handleOpenEditDialog}
            onDelete={handleDeleteCategory}
          />
        ))}
         <Card className="border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex items-center justify-center min-h-[250px]">
            <CardHeader className="text-center">
                <Button variant="ghost" className="w-full h-full text-lg" onClick={handleOpenAddDialog}>
                    <PlusCircle className="mr-2 h-6 w-6"/>
                    Add Category
                </Button>
            </CardHeader>
        </Card>
      </div>
       <CategoryDialog 
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onConfirm={handleDialogConfirm}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
}
