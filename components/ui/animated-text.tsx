'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  highlightWord?: string;
  className?: string;
  highlightClassName?: string;
  typewriterWords?: string[]; // Words to animate with typewriter effect
}

export function AnimatedText({ text, highlightWord, className = '', highlightClassName = '', typewriterWords = [] }: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const words = text.split(' ');
  const highlightIndex = highlightWord ? words.findIndex(word => word.toLowerCase().includes(highlightWord.toLowerCase())) : -1;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {words.map((word, index) => {
        const isHighlight = index === highlightIndex;
        // Check if this word is part of any typewriter phrase
        const isTypewriter = typewriterWords.some(tw => {
          const twWords = tw.toLowerCase().split(' ');
          return twWords.includes(word.toLowerCase());
        });

        if (isHighlight) {
          return (
            <motion.span
              key={index}
              className={`inline-block mr-1 ${highlightClassName}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.6,
                delay: 0.8,
                ease: "easeOut"
              }}
            >
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                {isTypewriter ? (
                  <TypewriterText text={word} delay={1200 + index * 200} />
                ) : (
                  word
                )}
              </motion.span>
              {index < words.length - 1 && ' '}
            </motion.span>
          );
        }

        if (isTypewriter) {
          return (
            <motion.span
              key={index}
              className="inline-block mr-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 + index * 0.1 }}
            >
              <TypewriterText text={word} delay={1200 + index * 200} />
              {index < words.length - 1 && ' '}
            </motion.span>
          );
        }

        return (
          <motion.span
            key={index}
            className="inline-block mr-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1 + 0.2,
              ease: "easeOut"
            }}
          >
            {word}
            {index < words.length - 1 && ' '}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TypewriterText({ text, className = '', delay = 0 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!isStarted) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50 + Math.random() * 50); // Variable typing speed for natural feel

      return () => clearTimeout(timeout);
    } else {
      // When finished typing, wait 2 seconds then restart
      const restartTimeout = setTimeout(() => {
        setDisplayText('');
        setCurrentIndex(0);
      }, 2000);

      return () => clearTimeout(restartTimeout);
    }
  }, [currentIndex, text, isStarted]);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
      setCurrentIndex(0);
      setDisplayText('');
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000 }}
    >
      {displayText}
      <motion.span
        className="inline-block w-0.5 h-6 bg-current ml-1 align-middle"
        animate={{ opacity: [1, 0, 1] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.span>
  );
}