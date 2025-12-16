"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary",
            checked ? "bg-primary" : "bg-muted"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 left-0.5 bg-background border border-input rounded-full h-5 w-5 transition-transform duration-200 ease-in-out",
              checked ? "transform translate-x-5" : ""
            )}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
