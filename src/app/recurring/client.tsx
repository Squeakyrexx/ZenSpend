
"use client";

import * as React from "react";
import { useZenStore } from "@/hooks/use-zen-store";
import type { RecurringPayment, Category } from "@/lib/types";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Icon } from "@/lib/icons.tsx";
import { NumpadDialog } from "@/components/ui/numpad-dialog";
import { Calendar } from "@/components/ui/calendar";
import { format, getDate } from "date-fns";
import { cn } from "@/lib/utils";


function AddRecurringPaymentDialog({
  open,
  onOpenChange,
  onConfirm,
  paymentToEdit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payment: Omit<RecurringPayment, "id">) => void;
  paymentToEdit: Omit<RecurringPayment, 'id'> | null;
}) {
  const { categories, categoryIcons } = useZenStore();
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState(0);
  const [category, setCategory] = React.useState<Category | "">("");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [isNumpadOpen, setIsNumpadOpen] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    if (paymentToEdit) {
      setDescription(paymentToEdit.description);
      setAmount(paymentToEdit.amount);
      setCategory(paymentToEdit.category);
      // Create a date object just to represent the day
      const newDate = new Date();
      newDate.setDate(paymentToEdit.dayOfMonth);
      setDate(newDate);
    } else {
      // Reset form when adding a new payment
      setDescription("");
      setAmount(0);
      setCategory("");
      setDate(undefined);
    }
  }, [paymentToEdit, open]);

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
    const dayOfMonth = date ? getDate(date) : undefined;
    
    if (
      !description.trim() ||
      !amount ||
      amount <= 0 ||
      !category ||
      !dayOfMonth
    ) {
      toast({
        variant: "destructive",
        title: "Invalid Information",
        description:
          "Please fill out all fields correctly.",
      });
      return;
    }

    onConfirm({
      description,
      amount: amount,
      category,
      icon: categoryIcons[category] || "Landmark",
      dayOfMonth: dayOfMonth,
    });

    onOpenChange(false);
  };

  const title = paymentToEdit ? "Edit Recurring Payment" : "Add Recurring Payment";
  const descriptionText = paymentToEdit ? "Update the details of your recurring payment." : "Add a bill or subscription that occurs regularly.";

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
                placeholder="e.g. Netflix, Rent"
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
                <Label htmlFor="day">Day of Month</Label>
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
                        {date ? format(date, "do") : <span>Pick a day</span>}
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
            <Button onClick={handleSubmit}>{paymentToEdit ? 'Save Changes' : 'Add Payment'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NumpadDialog
        open={isNumpadOpen}
        onOpenChange={setIsNumpadOpen}
        onConfirm={handleAmountConfirm}
        initialValue={amount}
        title="Set Recurring Payment Amount"
        description="Enter the fixed amount for this recurring payment."
      />
    </>
  );
}

function PaymentCard({ 
    payment,
    onEdit,
    onDelete,
}: { 
    payment: RecurringPayment;
    onEdit: (payment: RecurringPayment) => void;
    onDelete: (payment: RecurringPayment) => void;
}) {

    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    
    return (
        <Card className="hover:border-primary/50 transition-colors flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Icon name={payment.icon} className="h-8 w-8" />
                    {payment.description}
                </CardTitle>
                <CardDescription>{payment.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow">
                <p className="text-3xl font-bold">${payment.amount.toFixed(2)}</p>
                <p className="text-muted-foreground">Due on the {getOrdinal(payment.dayOfMonth)} of each month.</p>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
                <Button variant="outline" className="w-full" onClick={() => onEdit(payment)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
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
                            <AlertDialogAction onClick={() => onDelete(payment)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}

export function RecurringPaymentsClient() {
  const { recurringPayments, addRecurringPayment, deleteRecurringPayment, updateRecurringPayment, isInitialized } = useZenStore();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [paymentToEdit, setPaymentToEdit] = React.useState<RecurringPayment | null>(null);

  const { toast } = useToast();

  const handleConfirm = (paymentData: Omit<RecurringPayment, "id">) => {
    if (paymentToEdit) {
      updateRecurringPayment(paymentToEdit.id, paymentData);
      toast({
        title: "Payment Updated",
        description: `"${paymentData.description}" has been updated.`,
      });
    } else {
      addRecurringPayment(paymentData);
      toast({
        title: "Recurring Payment Added",
        description: `"${paymentData.description}" has been added.`,
      });
    }
    setPaymentToEdit(null);
  };

  const handleEdit = (payment: RecurringPayment) => {
    setPaymentToEdit(payment);
    setIsFormOpen(true);
  };

  const handleDeletePayment = (payment: RecurringPayment) => {
    deleteRecurringPayment(payment.id);
     toast({
      title: "Recurring Payment Deleted",
      description: `"${payment.description}" has been removed.`,
    });
  };
  
  const handleOpenChange = (open: boolean) => {
      setIsFormOpen(open);
      if (!open) {
          setPaymentToEdit(null);
      }
  }


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
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-9 w-full" />
                </CardFooter>
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
          <CardTitle>Recurring Payments</CardTitle>
          <CardDescription>
            Manage your regular bills, subscriptions, and other fixed expenses.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recurringPayments.sort((a, b) => a.dayOfMonth - b.dayOfMonth).map((payment) => (
              <PaymentCard 
                key={payment.id} 
                payment={payment}
                onEdit={handleEdit}
                onDelete={handleDeletePayment}
             />
          ))}
         <Card className="border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex items-center justify-center min-h-[250px]">
            <CardHeader className="text-center">
                <Button variant="ghost" className="w-full h-full text-lg" onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-6 w-6"/>
                    Add Payment
                </Button>
            </CardHeader>
        </Card>
      </div>

      <AddRecurringPaymentDialog
        open={isFormOpen}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        paymentToEdit={paymentToEdit}
      />
    </div>
  );
}
