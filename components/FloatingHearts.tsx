import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Heart {
  id: number;
  color: string;
  x: number; // Random horizontal offset
}

const COLORS = ['#FF4D4D', '#FF85B3', '#FF0055', '#FF3366', '#FFFFFF'];

export const FloatingHearts: React.FC<{ trigger: number }> = ({ trigger }) => {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const countRef = useRef(0);

  // When trigger increments, add a heart
  useEffect(() => {
    if (trigger === 0) return;
    const id = countRef.current++;
    const newHeart: Heart = {
      id,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: Math.random() * 60 - 30, // Random offset between -30px and 30px
    };
    
    setHearts(prev => [...prev, newHeart]);

    // Cleanup after animation
    const timeout = setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);

    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <div className="absolute bottom-20 right-4 w-20 h-64 pointer-events-none z-30">
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.5 }}
            animate={{ 
              opacity: 0, 
              y: -200, 
              x: heart.x + (Math.random() * 40 - 20), // Wiggle
              scale: 1.2 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-0 right-8"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill={heart.color}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
             </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
