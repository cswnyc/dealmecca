'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GradientHeroProps {
  className?: string;
}

export function GradientHero({ className = '' }: GradientHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      }
    })
  };

  const words = ["Currently", "Invite-Only"];

  return (
    <div className={`text-center ${className}`}>
      <div className="relative">
        {/* Animated gradient text */}
        <motion.div
          className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {words.map((word, wordIndex) => (
            <div key={word} className="block">
              {word.split('').map((letter, letterIndex) => (
                <motion.span
                  key={`${wordIndex}-${letterIndex}`}
                  className="inline-block gradient-text"
                  custom={wordIndex * 10 + letterIndex}
                  variants={letterVariants}
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  style={{
                    background: wordIndex === 0
                      ? `linear-gradient(135deg, #10b981 0%, #3b82f6 25%, #8b5cf6 50%, #ef4444 75%, #f59e0b 100%)`
                      : `linear-gradient(135deg, #06b6d4 0%, #8b5cf6 25%, #ec4899 50%, #10b981 75%, #3b82f6 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 3s ease-in-out infinite',
                    animationDelay: `${letterIndex * 0.05}s`,
                    textShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                    filter: 'brightness(1.2) contrast(1.1)'
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          ))}
        </motion.div>

        {/* Glowing background effect */}
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: 1, duration: 2 }}
        >
          <div
            className="w-full h-full blur-3xl"
            style={{
              background: `radial-gradient(
                ellipse at center,
                rgba(16, 185, 129, 0.3) 0%,
                rgba(59, 130, 246, 0.2) 25%,
                rgba(139, 92, 246, 0.2) 50%,
                rgba(236, 72, 153, 0.2) 75%,
                transparent 100%
              )`
            }}
          />
        </motion.div>
      </div>

      {/* Subtitle with typewriter effect */}
      <motion.div
        className="mt-8 md:mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          The intelligence platform that{' '}
          <motion.span
            className="text-emerald-400 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            closes deals faster
          </motion.span>
        </p>

        <motion.p
          className="text-md md:text-lg text-slate-400 mt-4 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.8 }}
        >
          Limited beta access for media sales professionals
        </motion.p>
      </motion.div>

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 100% 50%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .gradient-text {
          background-size: 400% 400% !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }

        @supports not (-webkit-background-clip: text) {
          .gradient-text {
            background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6) !important;
            color: #10b981 !important;
          }
        }
      `}</style>
    </div>
  );
}