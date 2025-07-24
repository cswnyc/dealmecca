"use client"

import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, indeterminate = false, onCheckedChange, disabled, id, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const isChecked = indeterminate ? false : checked;
    const showIndeterminate = indeterminate && !checked;

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        id={id}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          (checked || indeterminate) ? "bg-blue-600 border-blue-600 text-white" : "bg-white",
          className
        )}
        {...props}
      >
        {isChecked && (
          <div className="flex items-center justify-center text-current">
            <Check className="h-4 w-4" />
          </div>
        )}
        {showIndeterminate && (
          <div className="flex items-center justify-center text-current">
            <Minus className="h-4 w-4" />
          </div>
        )}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox } 