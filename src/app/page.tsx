
"use client";

import * as React from "react";
import { Loader2, Sparkles, ArrowRight, Check, Undo2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Transaction } from "@/lib/types";
import { parseTransactionDescription } from "./actions";
import { Numpad } from "@/components/ui/numpad";

type Step = "amount" | "description" | "loading" | "done";

export default function HomePage() {
  const { addTransaction, deleteTransaction, categories } = useZenStore();
  const { toast } = useToast();
  
  const [step, setStep] = React.useState<Step>("amount");
  const [amount, setAmount] = React.useState(0);
  const [description, setDescription] = React.useState("");
  const [lastTransaction, setLastTransaction] = React.useState<Transaction | null>(null);

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
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Description",
        description: "Please enter a description for your transaction.",
      });
      return;
    }

    setStep("loading");
    setLastTransaction(null);
    const result = await parseTransactionDescription(description, categories);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
      setStep("description"); // Go back to description step on error
    } else {
      const newTransaction: Transaction = {
        ...result,
        id: new Date().toISOString() + Math.random(),
        date: new Date().toISOString(),
        amount,
      };
      addTransaction(newTransaction);
      setLastTransaction(newTransaction);
      setStep("done");

      resetTimeoutRef.current = setTimeout(() => {
        handleReset();
      }, 5000); // Increased timeout to 5 seconds
    }
  };

  const handleReset = () => {
    if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
    }
    setStep("amount");
    setAmount(0);
    setDescription("");
    setLastTransaction(null);
  };
  
  const handleUndo = () => {
    if (lastTransaction) {
        deleteTransaction(lastTransaction.id);
        toast({
            title: "Transaction Undone",
            description: `"${lastTransaction.description}" was removed.`,
        });
        handleReset();
    }
  }

  const currentTitle = {
    amount: "What did you spend?",
    description: "What did you buy?",
    loading: "Analyzing...",
    done: "Transaction Logged!"
  }[step];

  const currentDescription = {
    amount: "Use the keypad to enter the transaction amount.",
    description: `You spent $${amount.toFixed(2)}. Now, describe the purchase.`,
    loading: "AI is categorizing your transaction...",
    done: "Your expense has been logged successfully."
  }[step];
  
  return (
    <div className="flex-1 w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {currentTitle}
          </h1>
          <p className="text-muted-foreground mt-2 min-h-[20px]">
            {currentDescription}
          </p>
        </div>
        
        <Card className="shadow-2xl shadow-primary/10 overflow-hidden">
          <CardContent className="p-6">
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
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
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

                {(step === "loading" || step === "done") && (
                   <div className="flex flex-col items-center justify-center text-center min-h-[404px]">
                     {step === 'loading' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                     {step === 'done' && <motion.div initial={{scale: 0.5}} animate={{scale: 1}}><Check className="h-24 w-24 text-green-500" /></motion.div>}
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
        
        {lastTransaction && (
           <Card className="bg-secondary/50 animate-in fade-in-50 slide-in-from-bottom-5">
             <CardContent className="p-4">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <span className="text-2xl">{lastTransaction.icon}</span>
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
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}
