"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MOCK_TRANSFERS = [
  { from: 'Ethereum', to: 'Solana', amount: '25,000 USDC', status: 'completed' },
  { from: 'BSC', to: 'Polygon', amount: '12 BNB', status: 'pending' },
  { from: 'Solana', to: 'Ethereum', amount: '1,500 SOL', status: 'processing' },
];

export function BridgeVisualizer() {
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);

  return (
    <div className="relative h-[400px] overflow-hidden">
      <div className="absolute inset-0">
        {transfers.map((transfer, i) => (
          <motion.div
            key={i}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className="mb-4 p-4 glass-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{transfer.from}</span>
                <span>→</span>
                <span>{transfer.to}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">{transfer.amount}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  transfer.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  transfer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {transfer.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
