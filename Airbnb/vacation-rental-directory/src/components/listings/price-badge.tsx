import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PriceBadgeProps {
  price: number; // in cents
  period?: "night" | "week" | "month";
  variant?: "default" | "secondary" | "outline" | "destructive";
  size?: "sm" | "default" | "lg";
  showCurrency?: boolean;
  className?: string;
}

export function PriceBadge({ 
  price, 
  period = "night",
  variant = "default",
  size = "default",
  showCurrency = true,
  className 
}: PriceBadgeProps) {
  const displayPrice = (price / 100).toFixed(0); // Convert from cents to dollars
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2 font-semibold"
  };

  const periodLabels = {
    night: "/night",
    week: "/week", 
    month: "/month"
  };

  return (
    <Badge 
      variant={variant}
      className={cn(
        "font-medium",
        sizeClasses[size],
        className
      )}
    >
      {showCurrency && "$"}{displayPrice}
      <span className="text-xs opacity-75 ml-0.5">
        {periodLabels[period]}
      </span>
    </Badge>
  );
}