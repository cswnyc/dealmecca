'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  Building2,
  Linkedin,
  Mail,
  Phone,
  Search,
  Sparkles,
} from 'lucide-react';

const MOCK_RESULTS = [
  {
    id: 1,
    name: 'Michael Epstein',
    title: 'Global CEO',
    company: 'Starcom',
    location: 'Chicago, IL',
    isDecisionMaker: true,
    avatar: 'ME',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-600',
  },
  {
    id: 2,
    name: 'Maureen Glure',
    title: 'Chief Client Officer',
    company: 'Starcom',
    location: 'New York, NY',
    isDecisionMaker: true,
    avatar: 'MG',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-600',
  },
  {
    id: 3,
    name: 'Karla Knecht',
    title: 'Chief Operating Officer',
    company: 'Starcom',
    location: 'Chicago, IL',
    isDecisionMaker: true,
    avatar: 'KK',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
  },
  {
    id: 4,
    name: 'Kim Einan',
    title: 'Chief Strategy Officer',
    company: 'Starcom',
    location: 'Chicago, IL',
    isDecisionMaker: false,
    avatar: 'KE',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-green-600',
  },
];

const SEARCH_QUERY = 'Starcom leadership';
const TYPING_SPEED = 80;
const PAUSE_BEFORE_RESULTS = 600;
const PAUSE_AFTER_RESULTS = 4000;
const PAUSE_BEFORE_RESET = 1000;

export default function HeroSearchAnimation(): JSX.Element {
  const [displayedQuery, setDisplayedQuery] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const timeoutIds: Array<ReturnType<typeof setTimeout>> = [];

    const schedule = (cb: () => void, ms: number): void => {
      timeoutIds.push(setTimeout(cb, ms));
    };

    let currentIndex = 0;

    const typeNextChar = (): void => {
      if (currentIndex < SEARCH_QUERY.length) {
        setDisplayedQuery(SEARCH_QUERY.slice(0, currentIndex + 1));
        currentIndex += 1;
        schedule(typeNextChar, TYPING_SPEED);
        return;
      }

      setIsTyping(false);
      setShowShimmer(true);

      schedule(() => {
        setShowShimmer(false);
        setShowResults(true);

        schedule(() => {
          setShowResults(false);
          setDisplayedQuery('');
          setIsTyping(true);
          currentIndex = 0;

          schedule(() => {
            setAnimationKey((prev) => prev + 1);
          }, PAUSE_BEFORE_RESET);
        }, PAUSE_AFTER_RESULTS);
      }, PAUSE_BEFORE_RESULTS);
    };

    schedule(typeNextChar, 500);

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [animationKey]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative p-4 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <Search className="w-5 h-5 text-white/40" />
            <div className="flex-1 relative">
              <span className="text-white/90 font-medium tracking-wide">
                {displayedQuery}
              </span>
              {isTyping && (
                <motion.span
                  className="inline-block w-0.5 h-5 bg-blue-400 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
              {displayedQuery.length === 0 && (
                <span className="text-white/30">Search companies, contacts...</span>
              )}
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-white/30 bg-white/5 rounded border border-white/10">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="relative min-h-[320px] p-4">
          <AnimatePresence mode="wait">
            {showShimmer && (
              <motion.div
                key="shimmer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {showResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between px-1 mb-4"
                >
                  <span className="text-sm text-white/50 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {MOCK_RESULTS.length} decision makers found
                  </span>
                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Starcom • Publicis Groupe
                  </span>
                </motion.div>

                {MOCK_RESULTS.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      delay: 0.15 + index * 0.1,
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer
                      ${
                        index === 0
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-white/20'
                      }`}
                  >
                    <div
                      className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${contact.gradientFrom} ${contact.gradientTo} flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-white font-semibold text-sm">
                        {contact.avatar}
                      </span>
                      {contact.isDecisionMaker && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                          <BadgeCheck className="w-3 h-3 text-amber-900" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold truncate">
                          {contact.name}
                        </h4>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded-full">
                            Top Match
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm truncate">
                        {contact.title}
                      </p>
                      <p className="text-white/40 text-xs">{contact.location}</p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        type="button"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        type="button"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-blue-400 transition-colors"
                        type="button"
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!showShimmer && !showResults && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[280px] text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/40 text-sm">
                  Search for any company or contact
                </p>
                <p className="text-white/20 text-xs mt-1">
                  500+ agencies • 2,000+ contacts
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


