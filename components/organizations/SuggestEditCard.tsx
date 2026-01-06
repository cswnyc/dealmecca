'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

export function SuggestEditCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl overflow-hidden hover:border-brand-primary dark:hover:border-[#5B8DFF] transition-all">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-primary/10 to-brand-violet/10 dark:from-[#5B8DFF]/20 dark:to-[#A78BFA]/20">
            <Lightbulb className="w-5 h-5 text-brand-primary dark:text-[#5B8DFF]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-brand-ink dark:text-white text-sm">
              Suggest an edit
            </h3>
            {!isExpanded && (
              <p className="text-xs text-muted-foreground mt-1">Click to expand</p>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border dark:border-dark-border pt-4">
          <div className="space-y-2 mb-4">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 accent-brand-primary" />
              <span className="text-foreground">Should we add or remove people?</span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 accent-brand-primary" />
              <span className="text-foreground">Are any teams no longer active?</span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 accent-brand-primary" />
              <span className="text-foreground">Are there other agencies we should add?</span>
            </label>
          </div>

          <textarea
            placeholder="Write your suggestion here..."
            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white dark:bg-dark-surface text-foreground placeholder-muted-foreground"
            rows={3}
          />

          <button
            className="w-full py-2 text-white rounded-lg text-sm font-medium mb-3 bg-gradient-to-br from-brand-primary to-brand-violet hover:opacity-90 transition-opacity"
          >
            Submit
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Share information with the community and obtain rewards when you do.
          </p>
        </div>
      )}
    </div>
  );
}

