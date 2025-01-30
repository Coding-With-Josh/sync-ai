'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CustomCursorProps {
  mousePosition: { x: number; y: number };
}

export default function CustomCursor({ mousePosition }: CustomCursorProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [trailPositions, setTrailPositions] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const handleHover = () => setIsHovering(true);
    const handleLeave = () => setIsHovering(false);

    // Handle hover states for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', handleHover);
      element.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      interactiveElements.forEach(element => {
        element.removeEventListener('mouseenter', handleHover);
        element.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);

  useEffect(() => {
    setTrailPositions(prev => {
      const newPositions = [...prev, mousePosition];
      if (newPositions.length > 5) newPositions.shift();
      return newPositions;
    });
  }, [mousePosition]);

  const variants = {
    default: {
      height: 16,
      width: 16,
      scale: 1,
    },
    hover: {
      height: 32,
      width: 32,
      scale: 1.5,
    }
  };

  return (
    <>
      {/* Cursor trails */}
      {trailPositions.map((pos, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-50"
          animate={{
            x: pos.x - 4,
            y: pos.y - 4,
            scale: 1 - (i * 0.2),
            opacity: 1 - (i * 0.2),
          }}
          transition={{ duration: 0.1 }}
        >
          <div className="w-2 h-2 bg-white rounded-full blur-[1px]" />
        </motion.div>
      ))}

      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        animate={isHovering ? 'hover' : 'default'}
        variants={variants}
        style={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
        }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white"
          animate={{
            scale: isHovering ? [1, 1.2, 1] : 1,
            rotate: isHovering ? [0, 90, 0] : 0,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Inner dot */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-1 h-1 -ml-[2px] -mt-[2px] bg-white rounded-full"
          animate={{
            scale: isHovering ? [1, 1.5, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white opacity-20 blur-md"
          animate={{
            scale: isHovering ? [1, 1.2, 1] : 1,
            opacity: isHovering ? [0.2, 0.3, 0.2] : 0.2,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </>
  );
}
