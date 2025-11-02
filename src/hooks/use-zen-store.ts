
"use client";

import { useState, useEffect, useCallback } from "react";
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

  const categories = budgets.map(b => b.category);
  const categoryIcons = budgets.reduce((acc, b) => ({ ...acc, [b.category]: b.icon }), {} as Record<string, string>);

  const checkRecurringPayments = useCallback(() => {
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
  }, [recurringPayments, setRecurringPayments, setTransactions, toast]);

  useEffect(() => {
    if (!isInitialized) {
        setIsInitialized(true);
        checkRecurringPayments();
    }
  }, [isInitialized, checkRecurringPayments]);

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
    const startOfCurrentMonth = startOfMonth(new Date());
    const monthlyTransactions = transactions.filter(t => isSameMonth(new Date(t.date), startOfCurrentMonth));

    setInternalBudgets(prevBudgets => {
        const newBudgets = prevBudgets.map(b => ({...b, spent: 0}));
        
        monthlyTransactions.forEach(t => {
            const budget = newBudgets.find(b => b.category === t.category);
            if (budget) {
                budget.spent += t.amount;
            }
        });
        
        if (JSON.stringify(newBudgets) !== JSON.stringify(prevBudgets)) {
            return newBudgets;
        }
        return prevBudgets;
    });
  }, [transactions, setInternalBudgets]);
  
  
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
