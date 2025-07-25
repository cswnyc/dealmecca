"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    onValueChange: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  const setValue = React.useCallback((newValue: string) => {
    onValueChange(newValue)
  }, [onValueChange])

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div ref={ref} className={cn("", className)} {...props} />
    </TabsContext.Provider>
  )
})

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-700",
      className
    )}
    {...props}
  />
))

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;
  
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-white text-gray-900 shadow-sm" 
          : "text-gray-500 hover:text-gray-900",
        className
      )}
      onClick={() => context?.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
})
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  
  if (context?.value !== value) {
    return null;
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent } 