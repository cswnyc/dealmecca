"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

export interface AvailabilityData {
  date: string; // ISO date string
  available: boolean;
  price?: number; // in cents
  minStay?: number;
}

export interface AvailabilityCalendarProps {
  availability: AvailabilityData[];
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  onDateSelect?: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

export function AvailabilityCalendar({
  availability,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  className
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingRange, setSelectingRange] = useState<Date | null>(null);

  // Convert availability data to a map for quick lookup
  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailabilityData>();
    availability.forEach(item => {
      map.set(item.date, item);
    });
    return map;
  }, [availability]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availabilityMap.get(dateStr);
    
    if (!dayAvailability?.available) return;

    if (!onDateSelect) return;

    if (!selectingRange) {
      // Start new selection
      setSelectingRange(date);
      onDateSelect(date, null);
    } else if (isSameDay(selectingRange, date)) {
      // Clicking same date - clear selection
      setSelectingRange(null);
      onDateSelect(null, null);
    } else if (date < selectingRange) {
      // Clicking earlier date - start new selection
      setSelectingRange(date);
      onDateSelect(date, null);
    } else {
      // Complete the range
      setSelectingRange(null);
      onDateSelect(selectingRange, date);
    }
  };

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availabilityMap.get(dateStr);
    
    const isSelected = selectedStartDate && isSameDay(date, selectedStartDate);
    const isEndSelected = selectedEndDate && isSameDay(date, selectedEndDate);
    const isInRange = selectedStartDate && selectedEndDate && 
      date > selectedStartDate && date < selectedEndDate;
    const isSelectingStart = selectingRange && isSameDay(date, selectingRange);

    return {
      isCurrentMonth: isSameMonth(date, currentMonth),
      isAvailable: dayAvailability?.available ?? false,
      isSelected: isSelected || isEndSelected,
      isInRange,
      isSelectingStart,
      price: dayAvailability?.price,
      minStay: dayAvailability?.minStay
    };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(date => {
            const status = getDayStatus(date);
            
            return (
              <div key={date.toISOString()} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full h-12 p-1 text-xs flex flex-col items-center justify-center",
                    !status.isCurrentMonth && "text-gray-300",
                    status.isAvailable && status.isCurrentMonth && "hover:bg-blue-50 cursor-pointer",
                    !status.isAvailable && "text-gray-300 cursor-not-allowed hover:bg-transparent",
                    status.isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                    status.isInRange && "bg-blue-100 hover:bg-blue-200",
                    status.isSelectingStart && "bg-blue-500 text-white"
                  )}
                  onClick={() => handleDateClick(date)}
                  disabled={!status.isAvailable || !status.isCurrentMonth}
                >
                  <span className="font-medium">
                    {format(date, 'd')}
                  </span>
                  {status.price && status.isAvailable && status.isCurrentMonth && (
                    <span className="text-[10px] leading-none">
                      ${(status.price / 100).toFixed(0)}
                    </span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded" />
            <span>Unavailable</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>Selected</span>
          </div>
        </div>
        
        {(selectedStartDate || selectedEndDate) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            {selectedStartDate && !selectedEndDate && (
              <p className="text-sm text-blue-800">
                Check-in: {format(selectedStartDate, 'MMM d, yyyy')}
              </p>
            )}
            {selectedStartDate && selectedEndDate && (
              <div className="text-sm text-blue-800">
                <p>Check-in: {format(selectedStartDate, 'MMM d, yyyy')}</p>
                <p>Check-out: {format(selectedEndDate, 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}