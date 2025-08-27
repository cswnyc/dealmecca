import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Award, Star, Gem } from "lucide-react";
import { Tier } from "@/lib/validations";

const tierConfig = {
  BRONZE: {
    label: "Bronze",
    color: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    icon: Star,
    gradient: "from-orange-400 to-orange-600"
  },
  SILVER: {
    label: "Silver", 
    color: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    icon: Award,
    gradient: "from-gray-400 to-gray-600"
  },
  GOLD: {
    label: "Gold",
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", 
    icon: Crown,
    gradient: "from-yellow-400 to-yellow-600"
  },
  PLATINUM: {
    label: "Platinum",
    color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    icon: Gem,
    gradient: "from-purple-400 to-purple-600"
  }
};

export interface TierBadgeProps {
  tier: Tier;
  showIcon?: boolean;
  showLabel?: boolean;
  variant?: "solid" | "gradient" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function TierBadge({ 
  tier, 
  showIcon = true,
  showLabel = true,
  variant = "solid",
  size = "default",
  className 
}: TierBadgeProps) {
  const config = tierConfig[tier];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  let badgeClasses = "";
  
  if (variant === "gradient") {
    badgeClasses = `bg-gradient-to-r ${config.gradient} text-white hover:opacity-90`;
  } else if (variant === "outline") {
    badgeClasses = `border-2 bg-transparent hover:bg-opacity-10 ${config.color.replace('bg-', 'border-').replace('-100', '-300')}`;
  } else {
    badgeClasses = config.color;
  }

  return (
    <Badge 
      className={cn(
        "inline-flex items-center gap-1 font-medium border-0",
        badgeClasses,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <IconComponent className={iconSizes[size]} />
      )}
      {showLabel && config.label}
    </Badge>
  );
}