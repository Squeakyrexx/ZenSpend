
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Income, IncomeFrequency } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, PlusCircle, Trash2, Coins } from "lucide-react";
import { NumpadDialog } from "@/components/ui/numpad-dialog";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

function AddIncomeDialog({
  open,
  onOpenChange,
  onConfirm,
  incomeToEdit,
  incomeType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (income: Omit<Income, "id">) => void;
  incomeToEdit: Income | null;
  incomeType: 'fixed' | 'one-time';
}) {
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState(0);
  const [frequency, setFrequency] = React.useState<IncomeFrequency | "">("");
  const [isNumpadOpen, setIsNumpadOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (incomeToEdit) {
      setDescription(incomeToEdit.description);
      setAmount(incomeToEdit.amount);
      setFrequency(incomeToEdit.frequency);
    } else {
      setDescription("");
      setAmount(0);
      setFrequency(incomeType === 'one-time' ? 'one-time' : '');
    }
  }, [incomeToEdit, open, incomeType]);

  const handleAmountConfirm = (value: number) => {
    if (value > 0) {
      setAmount(value);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter an amount greater than zero.",
      });
    }
    setIsNumpadOpen(false);
  };

  const handleSubmit = () => {
    if (!description.trim() || !amount || amount <= 0 || !frequency) {
      toast({
        variant: "destructive",
        title: "Invalid Information",
        description: "Please fill out all fields correctly.",
      });
      return;
    }

    onConfirm({
      description,
      amount,
      frequency,
      startDate: new Date().toISOString(),
    });

    onOpenChange(false);
  };
  
  const title = incomeToEdit ? "Edit Income Source" : "Add Income Source";
  const descriptionText = incomeToEdit ? "Update the details of this income source." : `Add a new ${incomeType === 'one-time' ? 'one-time' : 'fixed'} source of income.`;

  const isEditingFixed = incomeToEdit && incomeToEdit.frequency !== 'one-time';
  const isEditingOneTime = incomeToEdit && incomeToEdit.frequency === 'one-time';
  const showFrequencySelector = !isEditingOneTime && incomeType !== 'one-time';


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{descriptionText}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  incomeType === 'one-time' 
                    ? "e.g. Side Gig, Freelance Work"
                    : "e.g. Monthly Salary, Etsy Shop"
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Button
                variant="outline"
                className="w-full justify-start font-normal"
                onClick={() => setIsNumpadOpen(true)}
              >
                {amount > 0 ? `$${amount.toFixed(2)}` : "Set Amount"}
              </Button>
            </div>
            {showFrequencySelector && (
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  onValueChange={(value: IncomeFrequency) => setFrequency(value)}
                  value={frequency}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select a frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>{incomeToEdit ? 'Save Changes' : 'Add Income'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NumpadDialog
        open={isNumpadOpen}
        onOpenChange={setIsNumpadOpen}
        onConfirm={handleAmountConfirm}
        initialValue={amount}
        title="Set Income Amount"
        description="Enter the amount for this income source."
      />
    </>
  );
}

function IncomeCard({
  income,
  onEdit,
  onDelete,
}: {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}) {
  return (
    <Card className="hover:border-primary/50 transition-colors flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-green-500" />
          {income.description}
        </CardTitle>
        <CardDescription className="capitalize">{income.frequency}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-3xl font-bold">${income.amount.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onEdit(income)}
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the "{income.description}" income
                source.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(income)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export function IncomeClient() {
  const { incomes, addIncome, updateIncome, deleteIncome, isInitialized } = useZenStore();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [incomeToEdit, setIncomeToEdit] = React.useState<Income | null>(null);
  const [incomeType, setIncomeType] = React.useState<'fixed' | 'one-time'>('fixed');

  const { toast } = useToast();

  const handleConfirm = (incomeData: Omit<Income, "id">) => {
    if (incomeToEdit) {
      updateIncome(incomeToEdit.id, incomeData);
      toast({
        title: "Income Updated",
        description: `"${incomeData.description}" has been updated.`,
      });
    } else {
      addIncome(incomeData);
      toast({
        title: "Income Added",
        description: `"${incomeData.description}" has been added.`,
      });
    }
    setIncomeToEdit(null);
  };

  const handleEdit = (income: Income) => {
    setIncomeType(income.frequency === 'one-time' ? 'one-time' : 'fixed');
    setIncomeToEdit(income);
    setIsFormOpen(true);
  };

  const handleDelete = (income: Income) => {
    deleteIncome(income.id);
    toast({
      title: "Income Deleted",
      description: `"${income.description}" has been removed.`,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setIncomeToEdit(null);
    }
  };

  const handleAddClick = (type: 'fixed' | 'one-time') => {
    setIncomeType(type);
    setIncomeToEdit(null);
    setIsFormOpen(true);
  }

  const fixedIncomes = (incomes || []).filter(i => i.frequency !== 'one-time');
  const oneTimeIncomes = (incomes || []).filter(i => i.frequency === 'one-time');
  
  const renderSkeleton = () => (
     <div className="p-4 md:p-8">
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
        <div className="space-y-6">
            <div>
                <Skeleton className="h-7 w-1/4 mb-4" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(2)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-8 w-1/3" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-9 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
             <div>
                <Skeleton className="h-7 w-1/4 mb-4" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-9 w-full" />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
      </div>
  )

  if (!isInitialized) {
    return renderSkeleton();
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Income</CardTitle>
          <CardDescription>
            Track your regular salaries and one-time earnings.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold mb-4">Fixed Income</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {fixedIncomes.map((income) => (
                    <IncomeCard
                        key={income.id}
                        income={income}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
                 <Card className="border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex items-center justify-center min-h-[250px]">
                    <CardHeader className="text-center">
                        <Button variant="ghost" className="w-full h-full text-lg" onClick={() => handleAddClick('fixed')}>
                            <PlusCircle className="mr-2 h-6 w-6"/>
                            Add Fixed Income
                        </Button>
                    </CardHeader>
                </Card>
            </div>
        </div>

        <Separator />

         <div>
            <h2 className="text-2xl font-bold mb-4">One-Time Income</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {oneTimeIncomes.map((income) => (
                    <IncomeCard
                        key={income.id}
                        income={income}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
                 <Card className="border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex items-center justify-center min-h-[250px]">
                    <CardHeader className="text-center">
                        <Button variant="ghost" className="w-full h-full text-lg" onClick={() => handleAddClick('one-time')}>
                            <PlusCircle className="mr-2 h-6 w-6"/>
                            Add One-Time Income
                        </Button>
                    </CardHeader>
                </Card>
            </div>
        </div>
      </div>

      <AddIncomeDialog
        open={isFormOpen}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        incomeToEdit={incomeToEdit}
        incomeType={incomeType}
      />
    </div>
  );
}
