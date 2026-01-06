'use client';

import { ArrowRight } from 'lucide-react';

interface ContactInfoCardProps {
  website?: string;
  lastUpdated?: string;
}

export function ContactInfoCard({ website, lastUpdated }: ContactInfoCardProps) {
  if (!website && !lastUpdated) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] rounded-xl p-5">
      <h3 className="text-xl font-bold text-[#162B54] dark:text-[#EAF0FF] mb-4">
        Contact Info
      </h3>
      <div className="space-y-4">
        {website && (
          <div>
            <p className="text-xs text-[#9AA7C2] dark:text-[#6B7A99] mb-1">Website</p>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2575FC] dark:text-[#5B8DFF] hover:underline flex items-center gap-1 text-sm"
            >
              {website.replace(/^https?:\/\//, '')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
        {lastUpdated && (
          <div className="pt-3 border-t border-[#E6EAF2] dark:border-[#22304A]">
            <p className="text-xs text-[#9AA7C2] dark:text-[#6B7A99]">
              Contact information last updated {lastUpdated}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

