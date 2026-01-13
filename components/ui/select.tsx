"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
}

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
  value: string;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={handleChange}
        value={value}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    return (
      <option
        ref={ref}
        className={cn("py-1 px-2", className)}
        value={value}
        {...props}
      >
        {children}
      </option>
    )
  }
)
SelectItem.displayName = "SelectItem"

// SelectTrigger and SelectValue are no longer needed as separate components
// since we're using a native select element
const SelectTrigger = ({ children }: SelectTriggerProps) => {
  return <>{children}</>;
};

const SelectValue = ({ placeholder }: SelectValueProps): JSX.Element | null => {
  if (!placeholder) {
    return null;
  }

  // Native <select> elements may only contain <option>/<optgroup>.
  // We ignore children to avoid introducing invalid nodes (which can cause hydration errors).
  return (
    <option value="" disabled hidden>
      {placeholder}
    </option>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };