"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_RESULTS = {
  marketCap: "$500,000",
  holders: 1250,
  liquidity: "$250,000",
  transactions: 458
};

export function LaunchSimulator() {
  const [launchParams, setLaunchParams] = useState({
    initialSupply: 1000000,
    tokenName: 'DEMO',
    distribution: 'fair',
  });
  const [results, setResults] = useState(MOCK_RESULTS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-4">Configure Launch</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={launchParams.tokenName}
            onChange={(e) => setLaunchParams({...launchParams, tokenName: e.target.value})}
            placeholder="Token Name"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
          />
          <input
            type="number"
            value={launchParams.initialSupply}
            onChange={(e) => setLaunchParams({...launchParams, initialSupply: +e.target.value})}
            placeholder="Initial Supply"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
          />
          <select
            value={launchParams.distribution}
            onChange={(e) => setLaunchParams({...launchParams, distribution: e.target.value})}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <option value="fair">Fair Launch</option>
            <option value="private">Private Sale</option>
            <option value="public">Public Sale</option>
          </select>
        </div>
        <button className="w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
          Simulate Launch
        </button>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold mb-6">Simulation Results</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(results).map(([key, value], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-lg bg-white/5"
            >
              <div className="text-gray-400 text-sm mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div className="text-xl font-bold">{value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
