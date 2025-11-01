"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { RecurringPayment, Category } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { Icon } from "@/lib/icons.tsx";

function AddRecurringPaymentDialog({
  open,
  onOpenChange,
  onAddPayment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPayment: (payment: Omit<RecurringPayment, "id">) => void;
}) {
  const { categories, categoryIcons } = useZenStore();
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState<Category | "">("");
  const [dayOfMonth, setDayOfMonth] = React.useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    const parsedDay = parseInt(dayOfMonth, 10);

    if (
      !description.trim() ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      !category ||
      isNaN(parsedDay) ||
      parsedDay < 1 ||
      parsedDay > 31
    ) {
      toast({
        variant: "destructive",
        title: "Invalid Information",
        description:
          "Please fill out all fields correctly. Day must be between 1 and 31.",
      });
      return;
    }

    onAddPayment({
      description,
      amount: parsedAmount,
      category,
      icon: categoryIcons[category] || "Landmark",
      dayOfMonth: parsedDay,
    });

    onOpenChange(false);
    setDescription("");
    setAmount("");
    setCategory("");
    setDayOfMonth("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Recurring Payment</DialogTitle>
          <DialogDescription>
            Add a bill or subscription that occurs regularly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Netflix, Rent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Day of Month</Label>
              <Input
                id="day"
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="e.g. 15"
                min="1"
                max="31"
              />
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
          <Button onClick={handleSubmit}>Add Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RecurringPaymentsClient() {
  const { recurringPayments, addRecurringPayment, deleteRecurringPayment, isInitialized } = useZenStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddPayment = (payment: Omit<RecurringPayment, "id">) => {
    addRecurringPayment(payment);
    toast({
      title: "Recurring Payment Added",
      description: `"${payment.description}" has been added to your recurring payments.`,
    });
  };

  const handleDeletePayment = (payment: RecurringPayment) => {
    deleteRecurringPayment(payment.id);
     toast({
      title: "Recurring Payment Deleted",
      description: `"${payment.description}" has been removed.`,
    });
  };
  
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  if (!isInitialized) {
    return (
      <div className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-10 w-32 mb-4" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recurring Payments</CardTitle>
          <CardDescription>
            Manage your regular bills and subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Payment
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
         {recurringPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringPayments.sort((a, b) => a.dayOfMonth - b.dayOfMonth).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                        <Icon name={payment.icon} className="h-5 w-5 text-muted-foreground" />
                        {payment.description}
                    </TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell>The {getOrdinal(payment.dayOfMonth)}</TableCell>
                    <TableCell className="text-right font-semibold">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive/80 hover:text-destructive">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the "{payment.description}" recurring payment.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePayment(payment)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-lg font-semibold">No recurring payments yet.</p>
              <p className="text-muted-foreground">
                Add a bill or subscription to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddRecurringPaymentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddPayment={handleAddPayment}
      />
    </div>
  );
}
