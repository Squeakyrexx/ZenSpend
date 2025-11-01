"use client";

import * as React from "react";
import { ArrowRight, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumpadProps {
  onConfirm: (value: number) => void;
  initialValue?: string;
  className?: string;
}

export function Numpad({ onConfirm, initialValue = "0", className }: NumpadProps) {
  const [value, setValue] = React.useState(initialValue);

  // When the component mounts or initialValue changes, reset the state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);


  const handlePress = (key: string) => {
    if (key === "backspace") {
      if (value.length > 1) {
        setValue(value.slice(0, -1));
      } else {
        setValue("0");
      }
      return;
    }

    if (key === "." && value.includes(".")) {
      return;
    }
    
    // Limit to 2 decimal places
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1 && value.length - decimalIndex > 2) {
      return;
    }

    if (value === "0" && key !== ".") {
      setValue(key);
    } else {
      setValue(value + key);
    }
  };

  const handleConfirm = () => {
    onConfirm(parseFloat(value));
  };

  const numpadKeys = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    ".", "0"
  ];

  return (
    <div className={cn("flex flex-col items-center space-y-4 pt-4", className)}>
      <div className="text-7xl font-bold tracking-tighter w-full text-center p-4 rounded-lg bg-secondary/50 truncate">
        <span className="text-4xl font-medium align-middle text-muted-foreground mr-1">$</span>
        {value}
      </div>
      <div className="grid grid-cols-3 gap-2 w-full">
        {numpadKeys.map((key) => (
          <Button
            key={key}
            variant="secondary"
            className="h-16 text-3xl font-bold"
            onClick={() => handlePress(key)}
          >
            {key}
          </Button>
        ))}
        <Button
            variant="secondary"
            className="h-16 text-3xl font-bold"
            onClick={() => handlePress("backspace")}
        >
            <Delete />
        </Button>
      </div>
      <Button size="lg" className="w-full font-bold text-lg" onClick={handleConfirm}>
        Confirm <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}
