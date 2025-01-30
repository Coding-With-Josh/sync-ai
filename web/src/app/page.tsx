"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CustomCursor from "../components/CustomCursor";
import MagneticButton from "@/components/MagneticButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Spotlight from "@/components/Spotlight";
import Link from "next/link";
import { TokenTracker } from "@/components/TokenTracker";
import { LaunchSimulator } from "@/components/LaunchSimulator";
import { BridgeVisualizer } from "@/components/BridgeVisualizer";
// import { MetricsDashboard } from "@/components/MetricsDashboard";
// import { GovernancePanel } from "@/components/GovernancePanel";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress, scrollY } = useScroll();
  const headerRef = useRef(null);

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen cursor-none">
      <Navbar />
      <Spotlight />
      <CustomCursor mousePosition={mousePosition} />

      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[300px] h-[300px] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`,
              left: `${i * 30}%`,
              top: `${i * 20}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Enhanced Hero Section */}
      <motion.section
        ref={headerRef}
        style={{ opacity }}
        className="h-screen flex items-center justify-center relative overflow-hidden"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center max-w-5xl px-4 relative z-10"
        >
          <motion.h1
            className="text-8xl md:text-[12rem] font-bold mb-8 tracking-tighter leading-none"
            style={{ y: y1 }}
          >
            MULTI
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-white">
              CHAIN
            </span>
          </motion.h1>
          <motion.p
            className="text-2xl md:text-3xl text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Launch and{" "}
            <span className="bg-blue-700 hover:scale-110 transition-all duration-300 text-white px-1">
              sync
            </span>{" "}
            your token across multiple chains with our secure and efficient
            platform
          </motion.p>
          <div className="flex flex-col gap-6 justify-center items-center">
            <MagneticButton href="/launch">
              <span className="text-lg">Launch Now →</span>
            </MagneticButton>

            <appkit-button />
          </div>
        </motion.div>

        {/* Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      </motion.section>

      {/* Supported Chains */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="py-20 px-8 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center text-gray-400"
            style={{ y: y2 }}
          >
            SUPPORTED NETWORKS
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            {["Ethereum", "BSC", "Polygon", "Arbitrum", "Optimism"].map(
              (chain, i) => (
                <motion.div
                  key={chain}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-white/10 rounded-full mb-4" />
                  <span className="text-sm font-medium">{chain}</span>
                </motion.div>
              )
            )}
          </div>
        </div>
      </motion.section>

      {/* New Token Price Tracker Section */}
      <motion.section className="py-20 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto glass-card p-8">
          <h2 className="text-4xl font-bold mb-8">Live Token Metrics</h2>
          <TokenTracker />
        </div>
      </motion.section>

      {/* New Launch Simulator Section */}
      <motion.section className="py-20 px-8 relative">
        <div className="max-w-7xl mx-auto glass-card p-8">
          <h2 className="text-4xl font-bold mb-8">Test Your Launch</h2>
          <LaunchSimulator />
        </div>
      </motion.section>

      {/* New Bridge Visualizer */}
      <motion.section className="py-20 px-8 relative">
        <div className="max-w-7xl mx-auto glass-card p-8">
          <h2 className="text-4xl font-bold mb-8">Cross-Chain Bridge</h2>
          <BridgeVisualizer />
        </div>
      </motion.section>

      {/*
      // New Metrics Dashboard
      <motion.section className="py-20 px-8 relative">
        <div className="max-w-7xl mx-auto glass-card p-8">
          <h2 className="text-4xl font-bold mb-8">Platform Analytics</h2>
          <MetricsDashboard />
        </div>
      </motion.section>

      // New Governance Section
      <motion.section className="py-20 px-8 relative">
        <div className="max-w-7xl mx-auto glass-card p-8">
          <h2 className="text-4xl font-bold mb-8">Community Governance</h2>
          <GovernancePanel />
        </div>
      </motion.section> 
      */}

      {/* Enhanced Featured Projects */}
      <section className="min-h-screen py-32 px-8 relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            className="text-7xl md:text-9xl font-bold mb-24 tracking-tighter text-center"
            style={{ y: y1 }}
          >
            FEATURED
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-white">
              LAUNCHES
            </span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              "Project Alpha",
              "Project Beta",
              "Project Gamma",
              "Project Delta",
            ].map((project, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 0.98, rotateX: 5, rotateY: 5 }}
                className="relative h-[60vh] overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/10 p-1"
              >
                <div className="absolute inset-0.5 rounded-3xl bg-black p-8 flex flex-col justify-between backdrop-blur-xl">
                  <div>
                    <h3 className="text-3xl font-bold mb-4">{project}</h3>
                    <p className="text-gray-400">
                      Revolutionary DeFi protocol launching soon
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400">Upcoming</span>
                      <span className="text-gray-400">Q2 2024</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center py-32 px-8"
      >
        <div className="text-center">
          <h2 className="text-7xl md:text-9xl font-bold mb-8 tracking-tighter">
            READY TO
            <br />
            LAUNCH?
          </h2>
          <MagneticButton>
            <span className="text-lg">Get Started →</span>
          </MagneticButton>
        </div>
      </motion.section>
      <Footer />
    </div>
  );
}
