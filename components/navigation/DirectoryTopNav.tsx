'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';

interface DirectoryTopNavProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const NAV_ITEMS = [
  { href: '/organizations', label: 'Directory', soon: false },
  { href: '#', label: 'Accounts', soon: true },
  { href: '#', label: 'Network', soon: true },
  { href: '#', label: 'Insights', soon: true },
];

export function DirectoryTopNav({ searchQuery = '', onSearchChange }: DirectoryTopNavProps) {
  const pathname = usePathname();
  const { user } = useFirebaseAuth();
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    setIsDark(next);
  };

  // User initials for avatar
  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[#E6EAF2] dark:border-[#22304A]"
      style={{
        background: 'color-mix(in srgb, var(--surface, #FFFFFF) 86%, transparent)',
        backdropFilter: 'blur(12px) saturate(1.4)',
      }}
    >
      <div className="flex items-center h-16 px-6 gap-6 max-w-[1200px] mx-auto">
        {/* Logo + tagline */}
        <Link href="/organizations" className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
            style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
          >
            M
          </div>
          <div className="hidden sm:block">
            <div className="text-[15px] font-extrabold tracking-tight text-[#0B1220] dark:text-[#EAF0FF]">
              DealMecca
            </div>
            <div className="text-[10.5px] text-[#64748B] dark:text-[#9AA7C2] font-medium -mt-0.5">
              Intelligence that closes
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href !== '#' && pathname?.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-3.5 py-2 text-[14.5px] font-semibold transition-colors ${
                  isActive
                    ? 'text-[#0B1220] dark:text-[#EAF0FF]'
                    : 'text-[#64748B] dark:text-[#9AA7C2] hover:text-[#334155] dark:hover:text-[#C7D2FE]'
                }`}
              >
                {item.label}
                {item.soon && (
                  <span className="ml-1.5 text-[10px] font-semibold text-[#94a3b8] dark:text-[#64748B] bg-[#F3F6FB] dark:bg-[#101E38] px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Global search */}
        <div className="relative hidden sm:block w-full max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#64748B] dark:text-[#9AA7C2]" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search agencies, advertisers, holding cos..."
            className="w-full pl-11 pr-10 py-2.5 bg-[#F3F6FB] dark:bg-[#101E38] border border-[#E6EAF2] dark:border-[#22304A] rounded-full text-sm text-[#0B1220] dark:text-[#EAF0FF] placeholder-[#94a3b8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2575FC]/20 focus:border-[#2575FC]/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] dark:text-[#9AA7C2] hover:bg-[#F3F6FB] dark:hover:bg-[#101E38] transition-colors"
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* User avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
