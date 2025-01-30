'use client';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="py-20 px-8 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">LAUNCH•PAD</h3>
          <p className="text-gray-400">The next generation of token launches</p>
        </div>
        
        {['Products', 'Resources', 'Company', 'Legal'].map((section) => (
          <div key={section} className="space-y-4">
            <h4 className="text-lg font-semibold">{section}</h4>
            <ul className="space-y-2">
              {[1, 2, 3].map((item) => (
                <motion.li 
                  key={item}
                  whileHover={{ x: 5 }}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  {section} Link {item}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.footer>
  );
}
