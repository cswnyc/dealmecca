"use client"

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = ''
}: PaginationProps) {
  // Calculate displayed items range
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const generatePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 ${className}`}>
      {/* Results Info */}
      <div className="text-sm text-gray-700">
        Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNumber, index) => (
            <React.Fragment key={index}>
              {pageNumber === '...' ? (
                <div className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <Button
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber as number)}
                  className="h-8 w-8 p-0"
                >
                  {pageNumber}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Items Per Page Selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
} 