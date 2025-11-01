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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/lib/types";
import { NumpadDialog } from "@/components/ui/numpad-dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/lib/icons.tsx";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";


type SortKey = "description" | "category" | "amount" | "date";

export function TransactionsClient() {
  const { transactions, isInitialized, updateTransaction, deleteTransaction, categoryIcons } = useZenStore();
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = React.useState<Transaction | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const { toast } = useToast();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleEditAmount = (newAmount: number) => {
    if (editingTransaction) {
      if (newAmount > 0) {
        updateTransaction(editingTransaction.id, { amount: newAmount });
        toast({
            title: "Transaction Updated",
            description: `Amount set to $${newAmount.toFixed(2)}.`,
        });
      } else {
         toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: `Please enter a number greater than zero.`,
        });
      }
      setEditingTransaction(null);
    }
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
      const aVal = a[sortKey];
      const bVal = b[sortKey];

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
      
      <Button
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 h-16 w-16 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add Transaction</span>
      </Button>

      <AddTransactionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingTransaction && (
         <NumpadDialog
            open={!!editingTransaction}
            onOpenChange={(open) => !open && setEditingTransaction(null)}
            onConfirm={handleEditAmount}
            initialValue={editingTransaction.amount}
            title="Edit Transaction Amount"
            description={`Update the amount for "${editingTransaction.description}"`}
         />
      )}

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
