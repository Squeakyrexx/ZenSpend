
"use client";

import * as React from "react";
import { Loader2, Sparkles, ArrowRight, Check, Undo2, X, CalendarIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Transaction, Category } from "@/lib/types";
import { parseTransactionDescription } from "@/app/actions";
import { Numpad } from "@/components/ui/numpad";
import { Icon } from "@/lib/icons.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Step = "amount" | "description" | "loading" | "confirm" | "done";

interface ParsedResult {
  description: string;
  category: Category;
  icon: string;
}

export function AddTransactionView({ onComplete }: { onComplete: () => void }) {
  const { addTransaction, deleteTransaction, categories, categoryIcons } = useZenStore();
  const { toast } = useToast();
  
  const [step, setStep] = React.useState<Step>("amount");
  const [amount, setAmount] = React.useState(0);
  const [descriptionInput, setDescriptionInput] = React.useState("");
  const [lastTransaction, setLastTransaction] = React.useState<Transaction | null>(null);

  // State for the confirmation step
  const [parsedResult, setParsedResult] = React.useState<ParsedResult | null>(null);
  const [finalDescription, setFinalDescription] = React.useState("");
  const [finalCategory, setFinalCategory] = React.useState<Category | "">("");
  const [finalDate, setFinalDate] = React.useState<Date>(new Date());


  const resetTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleAmountSubmit = (value: number) => {
    if (value > 0) {
      setAmount(value);
      setStep("description");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter an amount greater than zero.",
      });
    }
  };
  
  const handleDescriptionSubmit = async () => {
    if (!descriptionInput.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Description",
        description: "Please enter a description for your transaction.",
      });
      return;
    }

    setStep("loading");
    setLastTransaction(null);
    const result = await parseTransactionDescription(descriptionInput, categories);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
      setStep("description"); // Go back to description step on error
    } else {
      const confirmedResult = result as ParsedResult;
      setParsedResult(confirmedResult);
      setFinalDescription(confirmedResult.description);
      setFinalCategory(confirmedResult.category);
      setFinalDate(new Date());
      setStep("confirm");
    }
  };
  
  const handleConfirmSubmit = () => {
    if (!finalDescription || !finalCategory || !finalDate) {
         toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please ensure all fields are filled out.",
         });
        return;
    }

    const newTransaction: Transaction = {
      id: new Date().toISOString() + Math.random(),
      amount,
      description: finalDescription,
      category: finalCategory,
      icon: categoryIcons[finalCategory] || 'Landmark',
      date: finalDate.toISOString(),
    };
    
    addTransaction(newTransaction);
    setLastTransaction(newTransaction);
    setStep("done");
  };


  const handleReset = (closeDialog: boolean = false) => {
    if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
    }
    setStep("amount");
    setAmount(0);
    setDescriptionInput("");
    setLastTransaction(null);
    setParsedResult(null);
    if(closeDialog && onComplete) {
        onComplete();
    }
  };
  
  const handleUndo = () => {
    if (lastTransaction) {
        deleteTransaction(lastTransaction.id);
        toast({
            title: "Transaction Undone",
            description: `"${lastTransaction.description}" was removed.`,
        });
        handleReset(true);
    }
  }

  const currentTitle = {
    amount: "What did you spend?",
    description: "What did you buy?",
    loading: "Analyzing...",
    confirm: "Confirm Details",
    done: "Transaction Logged!"
  }[step];

  const currentDescription = {
    amount: "Use the keypad to enter the transaction amount.",
    description: `You spent $${amount.toFixed(2)}. Now, describe the purchase.`,
    loading: "AI is categorizing your transaction...",
    confirm: "Review and confirm the transaction details below.",
    done: "Your expense has been logged successfully."
  }[step];
  
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {currentTitle}
          </h1>
          <p className="text-muted-foreground mt-2 min-h-[20px]">
            {currentDescription}
          </p>
        </div>
        
        <div className="shadow-2xl shadow-primary/10 overflow-hidden rounded-lg bg-card">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                {step === "amount" && (
                  <Numpad onConfirm={handleAmountSubmit} />
                )}

                {step === "description" && (
                   <div className="space-y-4">
                     <Textarea
                       placeholder="e.g. Lunch with friends, gas, new shoes"
                       className="min-h-[100px] text-lg rounded-xl focus-visible:ring-offset-4 focus-visible:ring-primary/50"
                       value={descriptionInput}
                       onChange={(e) => setDescriptionInput(e.target.value)}
                       autoFocus
                     />
                     <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setStep('amount')}><Undo2/> Back</Button>
                        <Button onClick={handleDescriptionSubmit} className="w-full">
                         <Sparkles className="mr-2 h-5 w-5" />
                         Categorize
                       </Button>
                     </div>
                   </div>
                )}
                
                {step === 'confirm' && parsedResult && (
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <Label htmlFor="confirm-description">Description</Label>
                         <Input id="confirm-description" value={finalDescription} onChange={(e) => setFinalDescription(e.target.value)} />
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input value={`$${amount.toFixed(2)}`} readOnly disabled />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="date">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !finalDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {finalDate ? format(finalDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={finalDate}
                                    onSelect={(d) => d && setFinalDate(d)}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="confirm-category">Category</Label>
                         <Select onValueChange={(value: Category) => setFinalCategory(value)} value={finalCategory}>
                            <SelectTrigger id="confirm-category">
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
                     <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={() => setStep('description')}><Undo2/> Back</Button>
                        <Button onClick={handleConfirmSubmit} className="w-full">
                         <Check className="mr-2 h-5 w-5" />
                         Confirm Transaction
                       </Button>
                     </div>
                   </div>
                )}


                {(step === "loading" || step === "done") && (
                   <div className="flex flex-col items-center justify-center text-center min-h-[404px]">
                     {step === 'loading' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                     {step === 'done' && (
                        <div className="flex flex-col items-center gap-4">
                            <motion.div initial={{scale: 0.5}} animate={{scale: 1}}><Check className="h-24 w-24 text-green-500" /></motion.div>
                            <Button onClick={() => handleReset()}>Add Another</Button>
                        </div>
                     )}
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {lastTransaction && step === "done" && (
           <div className="bg-secondary/50 rounded-lg animate-in fade-in-50 slide-in-from-bottom-5 p-4">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Icon name={lastTransaction.icon} className="h-6 w-6" />
                    <div>
                        <p className="font-semibold">{lastTransaction.description}</p>
                        <p className="text-sm text-muted-foreground">{lastTransaction.category} &bull; ${lastTransaction.amount.toFixed(2)}</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="sm" onClick={handleUndo}>
                    <Undo2 className="mr-2 h-4 w-4"/>
                    Undo
                 </Button>
               </div>
           </div>
        )}
      </div>
    </div>
  );
}

export function AddTransactionDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-screen h-screen max-w-full max-h-full sm:max-w-md sm:max-h-[90vh] sm:rounded-lg p-0 bg-background flex flex-col">
                <DialogHeader className="sr-only">
                    <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <AddTransactionView onComplete={() => onOpenChange(false)} />
                 <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}

    

    