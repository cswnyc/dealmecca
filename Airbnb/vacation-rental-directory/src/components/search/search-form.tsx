"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchFormProps {
  defaultValues?: {
    query?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  variant?: "default" | "compact" | "hero";
  className?: string;
}

export function SearchForm({ 
  defaultValues = {},
  variant = "default",
  className 
}: SearchFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const query = formData.get("query") as string;
    const location = formData.get("location") as string;
    const checkIn = formData.get("checkIn") as string;
    const checkOut = formData.get("checkOut") as string;
    const guests = formData.get("guests") as string;

    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests && guests !== "1") params.set("guests", guests);

    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    setIsLoading(false);
  };

  if (variant === "hero") {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="query" className="text-sm font-medium mb-2 block">
                  What are you looking for?
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="query"
                    name="query"
                    type="text"
                    placeholder="Search listings..."
                    className="pl-10"
                    defaultValue={defaultValues.query}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                  Where?
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="City, State"
                    className="pl-10"
                    defaultValue={defaultValues.location}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guests" className="text-sm font-medium mb-2 block">
                  Guests
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="guests"
                    name="guests"
                    type="number"
                    min="1"
                    max="20"
                    placeholder="1"
                    className="pl-10"
                    defaultValue={defaultValues.guests || 1}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn" className="text-sm font-medium mb-2 block">
                  Check-in
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    className="pl-10"
                    defaultValue={defaultValues.checkIn}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="checkOut" className="text-sm font-medium mb-2 block">
                  Check-out
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    className="pl-10"
                    defaultValue={defaultValues.checkOut}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Searching...</>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search Properties
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={cn("flex items-center space-x-2", className)}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            name="query"
            type="text"
            placeholder="Search..."
            className="pl-10"
            defaultValue={defaultValues.query}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
      </form>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="query" className="text-sm font-medium mb-2 block">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="query"
                  name="query"
                  type="text"
                  placeholder="Search properties..."
                  className="pl-10"
                  defaultValue={defaultValues.query}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="City, State"
                  className="pl-10"
                  defaultValue={defaultValues.location}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}