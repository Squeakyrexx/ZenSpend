
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Transaction, Budget, Category, RecurringPayment, Income, IncomeFrequency } from "@/lib/types";
import { DEFAULT_BUDGETS } from "@/lib/data";
import { useToast } from "./use-toast";
import { isSameMonth, isPast, startOfMonth, isToday } from "date-fns";

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useZenStore = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("zen-transactions", []);
  const [budgets, setInternalBudgets] = useLocalStorage<Budget[]>("zen-budgets", DEFAULT_BUDGETS);
  const [recurringPayments, setRecurringPayments] = useLocalStorage<RecurringPayment[]>("zen-recurring-payments", []);
  const [incomes, setIncomes] = useLocalStorage<Income[]>("zen-incomes", []);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const categories = useMemo(() => budgets.map(b => b.category), [budgets]);
  const categoryIcons = useMemo(() => budgets.reduce((acc, b) => ({ ...acc, [b.category]: b.icon }), {} as Record<string, string>), [budgets]);

  // --- Automatic Recurring Payment Logging ---
  useEffect(() => {
    if (!isInitialized) {
      const today = new Date();
      const newTransactions: Transaction[] = [];
      let somethingChanged = false;

      const updatedPayments = recurringPayments.map(p => {
          const lastLoggedDate = p.lastLogged ? new Date(p.lastLogged) : null;
          const dueDateInCurrentMonth = new Date(today.getFullYear(), today.getMonth(), p.dayOfMonth);

          if ((isPast(dueDateInCurrentMonth) || isToday(dueDateInCurrentMonth)) && (!lastLoggedDate || !isSameMonth(lastLoggedDate, today))) {
              const transaction: Transaction = {
                  id: `recurring-${p.id}-${dueDateInCurrentMonth.toISOString()}`,
                  amount: p.amount,
                  description: p.description,
                  category: p.category,
                  icon: p.icon,
                  date: dueDateInCurrentMonth.toISOString(),
              };
              newTransactions.push(transaction);

              toast({
                  title: "Recurring Payment Logged",
                  description: `Automatically logged "${p.description}" for $${p.amount.toFixed(2)}.`,
              });
              
              somethingChanged = true;
              return { ...p, lastLogged: today.toISOString() };
          }
          return p;
      });

      if (somethingChanged) {
          setTransactions(current => [...newTransactions, ...current]);
          setRecurringPayments(updatedPayments);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, recurringPayments, setRecurringPayments, setTransactions, toast]);


  // --- TRANSACTIONS ---
  const addTransaction = (transaction: Transaction) => {
      setTransactions(prev => [transaction, ...prev]);
  };
  
  const updateTransaction = (transactionId: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  // --- BUDGETS & CATEGORIES ---
  const setBudgets = (newBudgets: Budget[]) => {
    setInternalBudgets(newBudgets);
  };

  const updateBudgetLimit = (category: Category, newLimit: number) => {
      setInternalBudgets(prev => 
        prev.map(budget => 
          budget.category === category
            ? { ...budget, limit: newLimit }
            : budget
        )
      );
  };
  
  const addCategory = (category: string, icon: string, limit: number, color: string) => {
    setInternalBudgets(prev => [...prev, { category, icon, limit, spent: 0, color }]);
  };
  
  const updateCategory = (originalCategory: string, updates: Partial<Omit<Budget, 'spent'>>) => {
    setInternalBudgets(prev => prev.map(b => b.category === originalCategory ? {...b, ...updates} : b));
    if (updates.category && updates.category !== originalCategory) {
      setTransactions(prev => prev.map(t => t.category === originalCategory ? {...t, category: updates.category!} : t));
      setRecurringPayments(prev => prev.map(p => p.category === originalCategory ? {...p, category: updates.category!} : p));
    }
  };

  const deleteCategory = (category: Category) => {
      setInternalBudgets(prev => prev.filter(b => b.category !== category));
      setTransactions(prev => prev.filter(t => t.category !== category));
      setRecurringPayments(prev => prev.filter(p => p.category !== category));
  };
  
  // --- RECURRING PAYMENTS ---
  const addRecurringPayment = (payment: Omit<RecurringPayment, 'id'>) => {
      const newPayment = { ...payment, id: new Date().toISOString() + Math.random(), lastLogged: null };
      setRecurringPayments(prev => [...prev, newPayment]);
  };

  const updateRecurringPayment = (paymentId: string, updates: Partial<Omit<RecurringPayment, 'id'>>) => {
    setRecurringPayments(prev => prev.map(p => p.id === paymentId ? { ...p, ...updates } : p));
  };
  
  const deleteRecurringPayment = (paymentId: string) => {
    setRecurringPayments(prev => prev.filter(p => p.id !== paymentId));
  };

  // --- INCOME ---
  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: new Date().toISOString() + Math.random() };
    setIncomes(prev => [...prev, newIncome]);
  };

  const updateIncome = (incomeId: string, updates: Partial<Omit<Income, 'id'>>) => {
    setIncomes(prev => prev.map(i => i.id === incomeId ? { ...i, ...updates } : i));
  };

  const deleteIncome = (incomeId: string) => {
    setIncomes(prev => prev.filter(i => i.id !== incomeId));
  };
  

  const resetData = () => {
      setTransactions([]);
      setInternalBudgets(DEFAULT_BUDGETS);
      setRecurringPayments([]);
      setIncomes([]);
  };
  
  // Recalculate budget spent amounts whenever transactions or recurring payments change
  useEffect(() => {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    
    // Get transactions that have already happened this month
    const monthlyTransactions = transactions.filter(t => isSameMonth(new Date(t.date), startOfCurrentMonth));

    setInternalBudgets(prevBudgets => {
        // Reset spent amount to 0 for all budgets
        const newBudgets = prevBudgets.map(b => ({...b, spent: 0}));
        
        // Add amounts from transactions that already occurred this month
        monthlyTransactions.forEach(t => {
            const budget = newBudgets.find(b => b.category === t.category);
            if (budget) {
                budget.spent += t.amount;
            }
        });
        
        // Add amounts from recurring payments scheduled for this month
        recurringPayments.forEach(p => {
          const budget = newBudgets.find(b => b.category === p.category);
          if (budget) {
            // Check if this recurring payment has already been logged as a transaction
            const isAlreadyLogged = monthlyTransactions.some(t => 
                t.description === p.description && 
                t.amount === p.amount &&
                isSameMonth(new Date(t.date), startOfCurrentMonth)
            );

            // If it's not already logged as a transaction, add its amount to the spent total
            if (!isAlreadyLogged) {
              budget.spent += p.amount;
            }
          }
        });

        // Only update state if the calculated values have actually changed
        if (JSON.stringify(newBudgets) !== JSON.stringify(prevBudgets)) {
            return newBudgets;
        }
        return prevBudgets;
    });
  }, [transactions, recurringPayments, setInternalBudgets]);
  
  
  const calculateMonthlyIncome = useCallback(() => {
    const today = new Date();
    let totalIncome = 0;
  
    incomes.forEach(income => {
        const incomeStartDate = new Date(income.startDate);
  
        if (incomeStartDate <= today) {
            if (income.frequency === 'one-time') {
                if (isSameMonth(incomeStartDate, today)) {
                    totalIncome += income.amount;
                }
            } else if (income.frequency === 'monthly') {
                totalIncome += income.amount;
            } else if (income.frequency === 'weekly') {
                totalIncome += income.amount * 4;
            } else if (income.frequency === 'bi-weekly') {
                 totalIncome += income.amount * 2;
            }
        }
    });
  
    return totalIncome;
  }, [incomes]);

  const calculateMonthlyExpenses = useCallback(() => {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    
    const monthlyTransactionsTotal = transactions
        .filter(t => isSameMonth(new Date(t.date), startOfCurrentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    return monthlyTransactionsTotal;
  }, [transactions]);


  return { 
    transactions, 
    budgets, 
    recurringPayments,
    incomes,
    categories,
    categoryIcons,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudgets,
    updateBudgetLimit, 
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    addIncome,
    updateIncome,
    deleteIncome,
    calculateMonthlyIncome,
    calculateMonthlyExpenses,
    resetData, 
    isInitialized 
  };
};
