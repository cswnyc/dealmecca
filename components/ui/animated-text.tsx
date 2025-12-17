'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { motionVariants, shouldReduceMotion } from '@/lib/design-tokens';

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

  const reducedMotion = shouldReduceMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
    >
      {(() => {
        // Find typewriter phrases and their positions
        const typewriterSegments = [];
        let processedWords = [...words];

        typewriterWords.forEach(phrase => {
          const phraseWords = phrase.toLowerCase().split(' ');
          for (let i = 0; i <= processedWords.length - phraseWords.length; i++) {
            const segment = processedWords.slice(i, i + phraseWords.length);
            if (segment.every((word, idx) => word.toLowerCase() === phraseWords[idx])) {
              typewriterSegments.push({
                startIndex: i,
                endIndex: i + phraseWords.length - 1,
                text: processedWords.slice(i, i + phraseWords.length).join(' '),
                originalPhrase: phrase
              });
              break;
            }
          }
        });

        const renderedElements = [];
        let currentIndex = 0;

        while (currentIndex < words.length) {
          // Check if current word is start of a typewriter segment
          const typewriterSegment = typewriterSegments.find(seg => seg.startIndex === currentIndex);

          if (typewriterSegment) {
            // Render typewriter segment as single unit
            renderedElements.push(
              <motion.span
                key={`typewriter-${currentIndex}`}
                className="inline-block mr-1"
                {...motionVariants.fadeIn}
                transition={{ delay: reducedMotion ? 0 : 1.0 }}
              >
                <TypewriterText text={typewriterSegment.text} delay={reducedMotion ? 0 : 1200} />
                {typewriterSegment.endIndex < words.length - 1 && ' '}
              </motion.span>
            );
            currentIndex = typewriterSegment.endIndex + 1;
          } else {
            // Render normal word
            const word = words[currentIndex];
            const isHighlight = currentIndex === highlightIndex;

            if (isHighlight) {
              renderedElements.push(
                <motion.span
                  key={currentIndex}
                  className={`inline-block mr-1 ${highlightClassName}`}
                  initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.6,
                    delay: reducedMotion ? 0 : 0.8,
                    ease: "easeOut"
                  }}
                >
                  <motion.span
                    animate={reducedMotion ? {} : {
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      repeat: reducedMotion ? 0 : Infinity,
                      repeatDelay: 1
                    }}
                    className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_100%]"
                  >
                    {word}
                  </motion.span>
                  {currentIndex < words.length - 1 && ' '}
                </motion.span>
              );
            } else {
              renderedElements.push(
                <motion.span
                  key={currentIndex}
                  className="inline-block mr-1"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.5,
                    delay: reducedMotion ? 0 : currentIndex * 0.1 + 0.2,
                    ease: "easeOut"
                  }}
                >
                  {word}
                  {currentIndex < words.length - 1 && ' '}
                </motion.span>
              );
            }
            currentIndex++;
          }
        }

        return renderedElements;
      })()}
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
  const reducedMotion = shouldReduceMotion();

  useEffect(() => {
    if (!isStarted) return;

    // If reduced motion, show all text immediately
    if (reducedMotion) {
      setDisplayText(text);
      return;
    }

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
  }, [currentIndex, text, isStarted, reducedMotion]);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
      setCurrentIndex(0);
      setDisplayText('');
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  const reducedMotionCheck = shouldReduceMotion();

  return (
    <motion.span
      className={className}
      {...motionVariants.fadeIn}
      transition={{ delay: reducedMotionCheck ? 0 : delay / 1000 }}
    >
      {displayText}
      {!reducedMotionCheck && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-current ml-1 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.span>
  );
}