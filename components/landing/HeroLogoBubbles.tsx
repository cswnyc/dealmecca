'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

type BubbleKind = 'Agency' | 'Advertiser';

type BubbleItem = {
  id: string;
  name: string;
  kind: BubbleKind;
  logoSrc?: string;
};

type BubbleLayout = {
  id: string;
  xPct: number;
  yPct: number;
  sizePx: number;
  floatDistancePx: number;
  floatDurationSec: number;
  floatDelaySec: number;
};

const BUBBLES: BubbleItem[] = [
  { id: '72andsunny', name: '72andSunny', kind: 'Agency', logoSrc: '/logos/72andsunny.jpeg' },
  { id: 'starcom', name: 'Starcom', kind: 'Agency' },
  { id: 'publicis', name: 'Publicis', kind: 'Agency' },
  { id: 'spotify', name: 'Spotify', kind: 'Advertiser', logoSrc: '/logos/spotify.svg' },
  { id: 'snapchat', name: 'Snapchat', kind: 'Advertiser', logoSrc: '/logos/snapchat.jpg' },
  { id: 'roku', name: 'Roku', kind: 'Advertiser', logoSrc: '/logos/roku.svg' },
  { id: 'vizio', name: 'Vizio', kind: 'Advertiser', logoSrc: '/logos/vizio.png' },
  { id: 'trade-desk', name: 'The Trade Desk', kind: 'Advertiser', logoSrc: '/logos/the-trade-desk.png' },
  { id: 'quantcast', name: 'Quantcast', kind: 'Advertiser', logoSrc: '/logos/quantcast.png' },
];

const LAYOUTS: BubbleLayout[] = [
  { id: '72andsunny', xPct: 18, yPct: 26, sizePx: 78, floatDistancePx: 12, floatDurationSec: 6.8, floatDelaySec: 0.2 },
  { id: 'starcom', xPct: 50, yPct: 18, sizePx: 70, floatDistancePx: 10, floatDurationSec: 7.4, floatDelaySec: 0.6 },
  { id: 'publicis', xPct: 82, yPct: 28, sizePx: 76, floatDistancePx: 14, floatDurationSec: 6.4, floatDelaySec: 0.1 },
  { id: 'spotify', xPct: 26, yPct: 52, sizePx: 72, floatDistancePx: 11, floatDurationSec: 7.2, floatDelaySec: 0.4 },
  { id: 'snapchat', xPct: 72, yPct: 52, sizePx: 68, floatDistancePx: 12, floatDurationSec: 6.9, floatDelaySec: 0.8 },
  { id: 'roku', xPct: 14, yPct: 76, sizePx: 66, floatDistancePx: 10, floatDurationSec: 7.8, floatDelaySec: 0.3 },
  { id: 'vizio', xPct: 42, yPct: 74, sizePx: 74, floatDistancePx: 13, floatDurationSec: 6.7, floatDelaySec: 0.7 },
  { id: 'trade-desk', xPct: 86, yPct: 72, sizePx: 80, floatDistancePx: 12, floatDurationSec: 7.1, floatDelaySec: 0.5 },
  { id: 'quantcast', xPct: 56, yPct: 46, sizePx: 64, floatDistancePx: 9, floatDurationSec: 8.2, floatDelaySec: 0.0 },
];

const POP_RESET_MS = 1300;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  const first = parts.at(0)?.slice(0, 1) ?? '';
  const second = parts.at(1)?.slice(0, 1) ?? (parts.at(0)?.slice(1, 2) ?? '');
  return `${first}${second}`.toUpperCase();
}

export default function HeroLogoBubbles(): JSX.Element {
  const [poppedIds, setPoppedIds] = useState<Record<string, boolean>>({});
  const resetTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const itemsWithLayout = useMemo(() => {
    const layoutById = new Map<string, BubbleLayout>(LAYOUTS.map((l) => [l.id, l]));
    return BUBBLES.map((item) => {
      const layout = layoutById.get(item.id);
      return { item, layout };
    }).filter((entry) => Boolean(entry.layout));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(resetTimersRef.current).forEach((t) => clearTimeout(t));
      resetTimersRef.current = {};
    };
  }, []);

  const popBubble = (id: string): void => {
    if (poppedIds[id] === true) {
      return;
    }

    setPoppedIds((prev) => ({ ...prev, [id]: true }));

    const existing = resetTimersRef.current[id];
    if (typeof existing !== 'undefined') {
      clearTimeout(existing);
    }

    resetTimersRef.current[id] = setTimeout(() => {
      setPoppedIds((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    }, POP_RESET_MS);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
        <div className="absolute -top-20 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-52 h-52 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative p-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <p className="text-sm text-white/70 font-medium truncate">
                Explore the ecosystem
              </p>
            </div>
            <p className="text-xs text-white/35 mt-1">
              Hover to pop logos • agencies + advertisers
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-white/60 border border-white/10">
              Agencies
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-white/60 border border-white/10">
              Advertisers
            </span>
          </div>
        </div>

        <div className="relative min-h-[320px] sm:min-h-[340px]">
          <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)] opacity-60">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
          </div>

          {itemsWithLayout.map(({ item, layout }) => {
            const isPopped = poppedIds[item.id] === true;
            const size = layout?.sizePx ?? 72;
            const x = layout?.xPct ?? 50;
            const y = layout?.yPct ?? 50;

            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <AnimatePresence mode="wait">
                  {!isPopped ? (
                    <motion.button
                      key="bubble"
                      type="button"
                      aria-label={`Pop ${item.name}`}
                      onClick={() => popBubble(item.id)}
                      onMouseEnter={() => popBubble(item.id)}
                      onFocus={() => popBubble(item.id)}
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.2 }}
                      style={{ width: size, height: size }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white/[0.06] border border-white/15 shadow-xl shadow-black/20"
                        animate={{ y: [0, -(layout?.floatDistancePx ?? 10), 0] }}
                        transition={{
                          duration: layout?.floatDurationSec ?? 7,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: layout?.floatDelaySec ?? 0,
                        }}
                      />

                      <motion.div
                        className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10"
                        animate={{ y: [0, (layout?.floatDistancePx ?? 10) * 0.4, 0] }}
                        transition={{
                          duration: (layout?.floatDurationSec ?? 7) * 1.1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: layout?.floatDelaySec ?? 0,
                        }}
                      />

                      <div className="relative z-10 w-full h-full rounded-full flex items-center justify-center">
                        {typeof item.logoSrc === 'string' ? (
                          <div className="relative w-[68%] h-[68%]">
                            <Image
                              src={item.logoSrc}
                              alt={item.name}
                              fill
                              sizes="120px"
                              className="object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-white font-bold tracking-wide">
                              {getInitials(item.name)}
                            </span>
                            <span className="mt-0.5 text-[10px] text-white/40">
                              {item.kind}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute -inset-4 rounded-full bg-blue-500/10 blur-2xl" />
                      </div>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="pop"
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="relative"
                      style={{ width: size, height: size }}
                    >
                      <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
                      <div className="absolute inset-2 rounded-full border border-white/20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <div className="px-3 py-1.5 rounded-full bg-black/20 border border-white/10 text-xs text-white/40">
              Pop bubbles to preview who you can sell into
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


