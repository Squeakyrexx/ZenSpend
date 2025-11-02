"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction, Category } from "@/lib/types";
import { NumpadDialog } from "@/components/ui/numpad-dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/lib/icons.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";


function EditTransactionDialog({
  open,
  onOpenChange,
  onConfirm,
  transaction
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (transactionId: string, updates: Partial<Transaction>) => void;
  transaction: Transaction | null;
}) {
  const { categories, categoryIcons } = useZenStore();
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState(0);
  const [category, setCategory] = React.useState<Category | "">("");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [isNumpadOpen, setIsNumpadOpen] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount);
      setCategory(transaction.category);
      setDate(new Date(transaction.date));
    }
  }, [transaction, open]);

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
  }

  const handleSubmit = () => {
    if (!transaction) return;

    if (!description.trim() || !amount || amount <= 0 || !category || !date) {
      toast({
        variant: "destructive",
        title: "Invalid Information",
        description: "Please fill out all fields correctly.",
      });
      return;
    }

    onConfirm(transaction.id, {
      description,
      amount,
      category,
      icon: categoryIcons[category] || "Landmark",
      date: date.toISOString(),
    });

    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the details of your expense.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch with friends"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                 <Button variant="outline" className="w-full justify-start font-normal" onClick={() => setIsNumpadOpen(true)}>
                    {amount > 0 ? `$${amount.toFixed(2)}` : "Set Amount"}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setCategory(value)} value={category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                         <Icon name={categoryIcons[cat] || 'Landmark'} className="h-4 w-4" />
                         {cat}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NumpadDialog
        open={isNumpadOpen}
        onOpenChange={setIsNumpadOpen}
        onConfirm={handleAmountConfirm}
        initialValue={amount}
        title="Set Transaction Amount"
        description="Enter the updated amount for this transaction."
      />
    </>
  );
}


type SortKey = "description" | "category" | "amount" | "date";

export function TransactionsClient() {
  const { transactions, isInitialized, updateTransaction, deleteTransaction, categoryIcons } = useZenStore();
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = React.useState<Transaction | null>(null);

  const { toast } = useToast();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleEditConfirm = (transactionId: string, updates: Partial<Transaction>) => {
    updateTransaction(transactionId, updates);
    toast({
        title: "Transaction Updated",
        description: `Your changes to "${updates.description}" have been saved.`,
    });
  };

  const handleDelete = () => {
    if (deletingTransaction) {
      deleteTransaction(deletingTransaction.id);
      toast({
        title: "Transaction Deleted",
        description: `"${deletingTransaction.description}" has been removed.`,
      });
      setDeletingTransaction(null);
    }
  };

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle date sorting properly
      if (sortKey === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [transactions, sortKey, sortDirection]);

  const renderSortArrow = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "desc" ? (
      <ArrowUpDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4" /> // Using same for both as visual indicator
    );
  };

  if (!isInitialized) {
    return (
      <div className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 relative h-full">
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            A complete history of your spending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold">No transactions yet.</p>
              <p className="text-muted-foreground">
                Click the + button to add a transaction.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("description")}
                    >
                      Description {renderSortArrow("description")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("category")}
                    >
                      Category {renderSortArrow("category")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort("amount")}>
                      Amount {renderSortArrow("amount")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    <Button variant="ghost" onClick={() => handleSort("date")}>
                      Date {renderSortArrow("date")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Icon name={categoryIcons[t.category] || t.icon} className="h-5 w-5" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${t.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                      {new Date(t.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(t)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive/80 hover:text-destructive" onClick={() => setDeletingTransaction(t)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <EditTransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onConfirm={handleEditConfirm}
        transaction={editingTransaction}
      />

      {deletingTransaction && (
        <AlertDialog
            open={!!deletingTransaction}
            onOpenChange={(open) => !open && setDeletingTransaction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the transaction for "${deletingTransaction.description}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingTransaction(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
