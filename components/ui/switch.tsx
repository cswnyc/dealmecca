"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2575FC] dark:focus-visible:ring-[#5B8DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked
            ? "bg-gradient-to-r from-[#2575FC] to-[#8B5CF6]"
            : "bg-[#CBD5E1] dark:bg-[#475569]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          disabled={disabled}
          readOnly
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
