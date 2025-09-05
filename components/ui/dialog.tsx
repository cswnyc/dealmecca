"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dialog = ({ children, open: controlledOpen, onOpenChange }: DialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
      {open && <DialogOverlay />}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = React.useContext(DialogContext)
  
  if (!context) {
    throw new Error('DialogTrigger must be used within a Dialog')
  }

  const handleClick = () => {
    context.onOpenChange(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick
    })
  }

  return (
    <button onClick={handleClick} className="inline-flex items-center">
      {children}
    </button>
  )
}

const DialogOverlay = () => {
  const context = React.useContext(DialogContext)
  
  if (!context) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50"
      onClick={() => context.onOpenChange(false)}
    />
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const DialogContent = ({ children, className }: DialogContentProps) => {
  const context = React.useContext(DialogContext)
  
  if (!context || !context.open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className={cn(
          "relative bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => context.onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-2">
    {children}
  </div>
)

const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </h2>
)

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">
    {children}
  </p>
)

const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2">
    {children}
  </div>
)

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}