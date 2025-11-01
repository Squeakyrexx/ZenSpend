"use client";

import { useState, useEffect, useCallback } from "react";
import type { Transaction, Budget, Category } from "@/lib/types";
import { DEFAULT_BUDGETS } from "@/lib/data";

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
  const [budgets, setBudgets] = useLocalStorage<Budget[]>("zen-budgets", DEFAULT_BUDGETS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect ensures that we only mark as initialized after the first render,
    // where localStorage values are actually available.
    setIsInitialized(true);
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
      setTransactions(prev => [transaction, ...prev]);
    }, [setTransactions]
  );
  
  const updateTransaction = useCallback((transactionId: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates } : t));
  }, [setTransactions]);

  const updateBudgetLimit = useCallback((category: Category, newLimit: number) => {
      setBudgets(prev => 
        prev.map(budget => 
          budget.category === category
            ? { ...budget, limit: newLimit }
            : budget
        )
      );
    }, [setBudgets]
  );
  
  const resetData = useCallback(() => {
      setTransactions([]);
      setBudgets(DEFAULT_BUDGETS);
    }, [setTransactions, setBudgets]
  );
  
  // Recalculate budget spent amounts whenever transactions change
  useEffect(() => {
    if(isInitialized) { // only run after initial load
        const newBudgets = DEFAULT_BUDGETS.map(b => ({...b, limit: budgets.find(bu => bu.category === b.category)?.limit ?? b.limit}));
        
        transactions.forEach(t => {
            const budget = newBudgets.find(b => b.category === t.category);
            if (budget) {
                budget.spent += t.amount;
            }
        });
        setBudgets(newBudgets);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, isInitialized]);


  return { 
    transactions, 
    budgets, 
    addTransaction,
    updateTransaction,
    updateBudgetLimit, 
    resetData, 
    isInitialized 
  };
};
