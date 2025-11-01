"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useZenStore } from "@/hooks/use-zen-store";
import type { Transaction } from "@/lib/types";
import { parseTransaction } from "./actions";

const FormSchema = z.object({
  prompt: z.string().min(1, {
    message: "Please enter a transaction.",
  }),
});

export default function HomePage() {
  const { addTransaction } = useZenStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastTransaction, setLastTransaction] = React.useState<Transaction | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setLastTransaction(null);
    const result = await parseTransaction(data.prompt);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      const newTransaction: Transaction = {
        ...result,
        id: new Date().toISOString() + Math.random(),
        date: new Date().toISOString(),
      };
      addTransaction(newTransaction);
      setLastTransaction(newTransaction);
      form.reset();
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                What did you spend?
            </h1>
            <p className="text-muted-foreground mt-2">
                Enter a transaction in plain English, like &ldquo;$7 coffee from Starbucks&rdquo;
            </p>
        </div>
        <Card className="shadow-2xl shadow-primary/10">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. $12 for lunch with friends, $50 on gas, new shoes for $80"
                          className="min-h-[100px] text-lg rounded-xl focus-visible:ring-offset-4 focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Log Transaction
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {lastTransaction && (
           <Card className="bg-secondary/50 animate-in fade-in-50 slide-in-from-bottom-5">
             <CardHeader>
               <CardTitle className="flex items-center gap-4">
                 <span className="text-3xl">{lastTransaction.icon}</span>
                 <span>Transaction Added</span>
               </CardTitle>
               <CardDescription>Your expense has been logged and your budget updated.</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="flex justify-between items-center">
                 <div>
                   <p className="font-semibold">{lastTransaction.description}</p>
                   <p className="text-sm text-muted-foreground">{lastTransaction.category}</p>
                 </div>
                 <p className="text-2xl font-bold">
                   ${lastTransaction.amount.toFixed(2)}
                 </p>
               </div>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}
