'use client';

import React from 'react';
import { Calendar, Plus } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters?: () => void;
  onSuggestEvent?: () => void;
}

export function EmptyState({ onClearFilters, onSuggestEvent }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl p-16">
      <div className="text-center max-w-md mx-auto">
        <div className="empty-state-icon w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-[#2575FC] dark:text-[#5B8DFF]" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold text-[#162B54] dark:text-[#EAF0FF] mb-2">No events found</h3>
        <p className="text-[#64748B] dark:text-[#9AA7C2] mb-6">Try adjusting your search or filters to find events</p>
        <div className="flex items-center justify-center gap-3">
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-5 py-2.5 bg-white dark:bg-[#101E38] border border-[#E6EAF2] dark:border-dark-border rounded-lg text-sm font-medium text-[#64748B] dark:text-[#9AA7C2] hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-all"
            >
              Clear All Filters
            </button>
          )}
          {onSuggestEvent && (
            <button
              onClick={onSuggestEvent}
              className="text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
            >
              <Plus className="w-4 h-4" />
              Suggest an Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
