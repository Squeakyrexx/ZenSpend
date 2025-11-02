
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Transaction, Budget, Category, RecurringPayment, Income, IncomeFrequency } from "@/lib/types";
import { DEFAULT_BUDGETS } from "@/lib/data";
import { useToast } from "./use-toast";
import { isSameMonth, isPast, startOfMonth, getDaysInMonth } from "date-fns";

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

  const categories = budgets.map(b => b.category);
  const categoryIcons = budgets.reduce((acc, b) => ({ ...acc, [b.category]: b.icon }), {} as Record<string, string>);

  useEffect(() => {
    if (!isInitialized) {
        setIsInitialized(true);
    }
  }, [isInitialized]);

  // --- TRANSACTIONS ---
  const addTransaction = useCallback((transaction: Transaction) => {
      setTransactions(prev => [transaction, ...prev]);
    }, [setTransactions]
  );
  
  const updateTransaction = useCallback((transactionId: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates } : t));
  }, [setTransactions]);

  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  }, [setTransactions]);

  // --- BUDGETS & CATEGORIES ---
  const setBudgets = useCallback((newBudgets: Budget[]) => {
    setInternalBudgets(newBudgets);
  }, [setInternalBudgets]);

  const updateBudgetLimit = useCallback((category: Category, newLimit: number) => {
      setInternalBudgets(prev => 
        prev.map(budget => 
          budget.category === category
            ? { ...budget, limit: newLimit }
            : budget
        )
      );
    }, [setInternalBudgets]
  );
  
  const addCategory = useCallback((category: string, icon: string, limit: number) => {
    setInternalBudgets(prev => [...prev, { category, icon, limit, spent: 0}]);
  }, [setInternalBudgets]);

  const deleteCategory = useCallback((category: Category) => {
      setInternalBudgets(prev => prev.filter(b => b.category !== category));
      setTransactions(prev => prev.filter(t => t.category !== category));
      setRecurringPayments(prev => prev.filter(p => p.category !== category));
    }, [setInternalBudgets, setTransactions, setRecurringPayments]
  );
  
  // --- RECURRING PAYMENTS ---
  const addRecurringPayment = useCallback((payment: Omit<RecurringPayment, 'id'>) => {
      const newPayment = { ...payment, id: new Date().toISOString() + Math.random(), lastLogged: null };
      setRecurringPayments(prev => [...prev, newPayment]);
  }, [setRecurringPayments]);

  const updateRecurringPayment = useCallback((paymentId: string, updates: Partial<Omit<RecurringPayment, 'id'>>) => {
    setRecurringPayments(prev => prev.map(p => p.id === paymentId ? { ...p, ...updates } : p));
  }, [setRecurringPayments]);
  
  const deleteRecurringPayment = useCallback((paymentId: string) => {
    setRecurringPayments(prev => prev.filter(p => p.id !== paymentId));
  }, [setRecurringPayments]);

  // --- INCOME ---
  const addIncome = useCallback((income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: new Date().toISOString() + Math.random() };
    setIncomes(prev => [...prev, newIncome]);
  }, [setIncomes]);

  const updateIncome = useCallback((incomeId: string, updates: Partial<Omit<Income, 'id'>>) => {
    setIncomes(prev => prev.map(i => i.id === incomeId ? { ...i, ...updates } : i));
  }, [setIncomes]);

  const deleteIncome = useCallback((incomeId: string) => {
    setIncomes(prev => prev.filter(i => i.id !== incomeId));
  }, [setIncomes]);
  

  const resetData = useCallback(() => {
      setTransactions([]);
      setInternalBudgets(DEFAULT_BUDGETS);
      setRecurringPayments([]);
      setIncomes([]);
    }, [setTransactions, setInternalBudgets, setRecurringPayments, setIncomes]
  );
  
  // Recalculate budget spent amounts whenever transactions change
  useEffect(() => {
    if(isInitialized) {
        const startOfCurrentMonth = startOfMonth(new Date());
        const monthlyTransactions = transactions.filter(t => isSameMonth(new Date(t.date), startOfCurrentMonth));

        const newBudgets = budgets.map(b => ({...b, spent: 0}));
        
        monthlyTransactions.forEach(t => {
            const budget = newBudgets.find(b => b.category === t.category);
            if (budget) {
                budget.spent += t.amount;
            }
        });
        setInternalBudgets(newBudgets);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, isInitialized]);
  
  // Check for due recurring payments
  useEffect(() => {
    if (isInitialized) {
      const today = new Date();
      const newTransactions: Transaction[] = [];
      const updatedPayments: RecurringPayment[] = [];

      recurringPayments.forEach(p => {
        const dueDate = new Date(today.getFullYear(), today.getMonth(), p.dayOfMonth);
        const lastLoggedDate = p.lastLogged ? new Date(p.lastLogged) : null;
        
        // Is the payment due this month and has it not been logged this month?
        if (isPast(dueDate) && (!lastLoggedDate || !isSameMonth(dueDate, lastLoggedDate))) {
          const newTransaction: Transaction = {
            id: `recurring-${p.id}-${new Date().toISOString()}`,
            amount: p.amount,
            description: p.description,
            category: p.category,
            icon: p.icon,
            date: dueDate.toISOString(),
          };
          newTransactions.push(newTransaction);
          updatedPayments.push({ ...p, lastLogged: today.toISOString() });
          
          toast({
            title: "Recurring Payment Logged",
            description: `Automatically logged "${p.description}" for $${p.amount.toFixed(2)}.`,
          });
        } else {
            updatedPayments.push(p);
        }
      });
      
      if (newTransactions.length > 0) {
        setTransactions(prev => [...newTransactions, ...prev]);
        setRecurringPayments(updatedPayments);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);
  
  const calculateMonthlyIncome = useCallback(() => {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    let totalIncome = 0;
  
    incomes.forEach(income => {
        const incomeStartDate = new Date(income.startDate);
  
        // Only consider income sources that have started
        if (incomeStartDate <= today) {
            if (income.frequency === 'one-time') {
                // Only include one-time income if it occurred in the current month
                if (isSameMonth(incomeStartDate, startOfCurrentMonth)) {
                    totalIncome += income.amount;
                }
            } else if (income.frequency === 'monthly') {
                totalIncome += income.amount;
            } else if (income.frequency === 'weekly') {
                totalIncome += income.amount * 4;
            } else if (income.frequency === 'bi-weekly') {
                 totalIncome += income.amount * 2; // Simplified for now
            }
        }
    });
  
    return totalIncome;
  }, [incomes]);

  const calculateMonthlyExpenses = useCallback(() => {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);

    const oneTimeExpenses = transactions
        .filter(t => isSameMonth(new Date(t.date), startOfCurrentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const recurringExpenses = recurringPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return oneTimeExpenses + recurringExpenses;
  }, [transactions, recurringPayments]);


  return { 
    transactions, 
    budgets, 
    categories,
    categoryIcons,
    recurringPayments,
    incomes,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
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
