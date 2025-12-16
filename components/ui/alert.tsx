"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "warning" | "info" }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-muted text-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    warning: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800",
    info: "bg-primary/10 text-primary border-primary/30"
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

export { Alert, AlertTitle, AlertDescription }