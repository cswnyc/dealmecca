"use client"

import * as React from "react"

interface CollapsibleContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | undefined>(undefined);

interface CollapsibleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Collapsible = ({ open, onOpenChange, children }: CollapsibleProps) => {
  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange }}>
      <div>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (context) {
      context.onOpenChange(!context.open);
    }
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      ref={ref}
      onClick={handleClick}
      {...props}
    />
  );
});

CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext);
  
  if (!context?.open) {
    return null;
  }
  
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

CollapsibleContent.displayName = "CollapsibleContent";

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} 