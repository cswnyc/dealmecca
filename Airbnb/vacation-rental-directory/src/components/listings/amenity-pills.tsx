import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  Car, 
  Waves, 
  ChefHat, 
  WashingMachine, 
  Snowflake, 
  Flame, 
  Tv, 
  Dumbbell,
  Building,
  Flower,
  Heart,
  Cigarette,
  Users,
  Briefcase,
  Mountain,
  Bath
} from "lucide-react";

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  car: Car,
  waves: Waves,
  "chef-hat": ChefHat,
  "washing-machine": WashingMachine,
  snowflake: Snowflake,
  flame: Flame,
  tv: Tv,
  dumbbell: Dumbbell,
  building: Building,
  flower: Flower,
  heart: Heart,
  cigarette: Cigarette,
  users: Users,
  briefcase: Briefcase,
  mountain: Mountain,
  bath: Bath,
};

export interface AmenityPillsProps {
  amenities: {
    id: string;
    name: string;
    icon?: string | null;
    category?: string;
  }[];
  maxVisible?: number;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function AmenityPills({ 
  amenities, 
  maxVisible = 6,
  variant = "secondary",
  size = "default",
  className 
}: AmenityPillsProps) {
  const visibleAmenities = amenities.slice(0, maxVisible);
  const remainingCount = amenities.length - maxVisible;

  const badgeSize = size === "sm" ? "text-xs px-2 py-1" : size === "lg" ? "text-base px-4 py-2" : "text-sm px-3 py-1";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleAmenities.map((amenity) => {
        const IconComponent = amenity.icon ? amenityIcons[amenity.icon] : null;
        
        return (
          <Badge 
            key={amenity.id} 
            variant={variant}
            className={`flex items-center space-x-1 ${badgeSize}`}
          >
            {IconComponent && <IconComponent className="h-3 w-3" />}
            <span>{amenity.name}</span>
          </Badge>
        );
      })}
      
      {remainingCount > 0 && (
        <Badge 
          variant="outline" 
          className={`${badgeSize} text-gray-600`}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}