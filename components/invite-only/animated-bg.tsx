'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className = '' }: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate floating orbs with different sizes and colors
  const orbs = [
    { size: 300, color: 'emerald', delay: 0, duration: 20 },
    { size: 200, color: 'blue', delay: 5, duration: 25 },
    { size: 150, color: 'purple', delay: 10, duration: 30 },
    { size: 100, color: 'pink', delay: 15, duration: 35 },
    { size: 250, color: 'teal', delay: 20, duration: 28 },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10';
      case 'blue':
        return 'bg-gradient-to-br from-blue-500/20 to-blue-600/10';
      case 'purple':
        return 'bg-gradient-to-br from-purple-500/20 to-purple-600/10';
      case 'pink':
        return 'bg-gradient-to-br from-pink-500/20 to-pink-600/10';
      case 'teal':
        return 'bg-gradient-to-br from-teal-500/20 to-teal-600/10';
      default:
        return 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10';
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Main gradient background */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(
              ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(16, 185, 129, 0.1) 0%,
              rgba(59, 130, 246, 0.05) 25%,
              rgba(139, 92, 246, 0.05) 50%,
              rgba(15, 23, 42, 0.8) 70%,
              rgba(15, 23, 42, 1) 100%
            ),
            linear-gradient(
              135deg,
              rgba(15, 23, 42, 1) 0%,
              rgba(30, 41, 59, 0.95) 50%,
              rgba(15, 23, 42, 1) 100%
            )
          `
        }}
      />

      {/* Animated floating orbs */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-xl ${getColorClasses(orb.color)}`}
          style={{
            width: orb.size,
            height: orb.size,
          }}
          initial={{
            x: -orb.size,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 400,
          }}
          animate={{
            x: [
              -orb.size,
              typeof window !== 'undefined' ? window.innerWidth + orb.size : 1200,
              -orb.size
            ],
            y: [
              typeof window !== 'undefined' ? Math.random() * window.innerHeight : 200,
              typeof window !== 'undefined' ? Math.random() * window.innerHeight : 600,
              typeof window !== 'undefined' ? Math.random() * window.innerHeight : 400,
            ],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.6, 0.2, 0.3],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            initial={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1200,
              y: typeof window !== 'undefined' ? window.innerHeight + 10 : 800,
            }}
            animate={{
              y: -10,
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1200,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Interactive light beam effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(
            600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
            rgba(16, 185, 129, 0.1),
            transparent 40%
          )`
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
      />

      {/* Corner accent gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
    </div>
  );
}