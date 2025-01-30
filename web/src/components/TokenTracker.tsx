"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_TOKENS = [
  {
    name: "SOL",
    price: "108.45",
    change: "+5.2%",
    volume: "2.1B",
    chart: [65, 72, 68, 74, 89, 85, 92, 108]
  },
  {
    name: "MULTI",
    price: "3.78",
    change: "+12.4%",
    volume: "542M",
    chart: [2.1, 2.4, 2.8, 3.1, 3.4, 3.6, 3.7, 3.78]
  },
  {
    name: "SYNC",
    price: "0.95",
    change: "+8.7%",
    volume: "124M",
    chart: [0.45, 0.52, 0.61, 0.73, 0.82, 0.88, 0.92, 0.95]
  }
];
export function TokenTracker() {
  const [tokenData, setTokenData] = useState(MOCK_TOKENS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tokenData.map((token, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-6 glass-card hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{token.name}</h3>
            <span className="text-emerald-400">${token.price}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">24h Change</span>
              <span className="text-emerald-400">{token.change}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Volume</span>
              <span className="text-gray-300">${token.volume}</span>
            </div>
            <div className="h-20 mt-4">
              <div className="h-full w-full flex items-end space-x-1">
                {token.chart.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / Math.max(...token.chart)) * 100}%` }}
                    transition={{ delay: i * 0.1 + index * 0.05 }}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
