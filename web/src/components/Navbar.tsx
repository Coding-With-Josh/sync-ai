import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full z-50 px-8 py-6 backdrop-blur-lg "
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div whileHover={{ scale: 1.05 }} className="text-2xl font-bold">
          <Link href="/">LAUNCH•PAD</Link>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          {["Projects", "Features", "Docs", "Connect"].map((item) => (
            <motion.a
              key={item}
              whileHover={{ y: -2 }}
              className="relative group"
              href="#"
            >
              {item}
              <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white transition-all group-hover:w-full" />
            </motion.a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          <div className="space-y-2">
            <span
              className={`block w-8 h-0.5 bg-white transform transition ${
                isOpen ? "rotate-45 translate-y-2.5" : ""
              }`}
            ></span>
            <span
              className={`block w-8 h-0.5 bg-white transition ${
                isOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block w-8 h-0.5 bg-white transform transition ${
                isOpen ? "-rotate-45 -translate-y-2.5" : ""
              }`}
            ></span>
          </div>
        </motion.button>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : "100%" }}
          className="fixed inset-0 bg-black bg-opacity-95 md:hidden"
          style={{ display: isOpen ? "block" : "none" }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {["Projects", "Features", "Docs", "Connect"].map((item) => (
              <motion.a
                key={item}
                whileHover={{ scale: 1.1 }}
                className="text-2xl"
                href="#"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
