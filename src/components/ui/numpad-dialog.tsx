
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Numpad } from "@/components/ui/numpad";

interface NumpadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: number) => void;
  initialValue?: number;
  title: string;
  description: string;
}

export function NumpadDialog({
  open,
  onOpenChange,
  onConfirm,
  initialValue = 0,
  title,
  description,
}: NumpadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Numpad 
            onConfirm={onConfirm} 
            initialValue={initialValue.toString()} 
        />
      </DialogContent>
    </Dialog>
  );
}
