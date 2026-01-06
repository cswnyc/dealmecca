'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

export function SuggestEditCardGradient() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl overflow-hidden">
      <div 
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F7F9FC] dark:hover:bg-[#101E38] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(37, 117, 252, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}
          >
            <Lightbulb className="w-5 h-5 text-[#2575FC] dark:text-[#5B8DFF]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#162B54] dark:text-[#EAF0FF]">
              Suggest an edit
            </h3>
            <p className="text-xs text-[#9AA7C2] dark:text-[#6B7A99]">Click to expand</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#9AA7C2] dark:text-[#6B7A99] transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[#E6EAF2] dark:border-dark-border pt-4">
          <div className="space-y-2 mb-4">
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" className="mt-0.5 accent-[#2575FC]" />
              <span className="text-[#64748B] dark:text-[#9AA7C2]">Should we add or remove people?</span>
            </label>
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" className="mt-0.5 accent-[#2575FC]" />
              <span className="text-[#64748B] dark:text-[#9AA7C2]">Are any teams no longer active?</span>
            </label>
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" className="mt-0.5 accent-[#2575FC]" />
              <span className="text-[#64748B] dark:text-[#9AA7C2]">Are there other agencies we should add?</span>
            </label>
          </div>

          <textarea
            placeholder="Write your suggestion here..."
            className="w-full px-3 py-2 border border-[#E6EAF2] dark:border-dark-border rounded-lg text-xs mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#2575FC]/20 focus:border-[#2575FC] bg-white dark:bg-dark-surfaceAlt text-[#162B54] dark:text-[#EAF0FF] placeholder-[#9AA7C2]"
            rows={3}
          />

          <button className="w-full py-2 bg-[#2575FC] hover:bg-[#1E63D8] text-white rounded-lg text-xs font-medium mb-3 transition-colors">
            Submit
          </button>

          <p className="text-xs text-[#9AA7C2] dark:text-[#6B7A99] text-center">
            Share information with the community and obtain rewards when you do.
          </p>
        </div>
      )}
    </div>
  );
}
