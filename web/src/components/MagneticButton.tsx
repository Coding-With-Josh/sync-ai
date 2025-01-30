import { useState } from 'react';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
}

export default function MagneticButton({ children, href }: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const button = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (button.left + button.width / 2);
    const y = e.clientY - (button.top + button.height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const ButtonContent = (
    <motion.button
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-8 py-4 bg-white text-black rounded-full text-lg font-bold relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );

  if (href) {
    return <Link href={href}>{ButtonContent}</Link>;
  }

  return ButtonContent;
}
