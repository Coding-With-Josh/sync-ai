import { motion } from "framer-motion";

const chains = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    icon: '🔷',
    fee: '~0.05 ETH',
    status: 'active', // Change this from 'coming soon' to 'active'
    tps: '15-30',
    marketCap: '$250B+'
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    icon: '💜',
    fee: '< $0.01',
    status: 'active',
    tps: '65,000+',
    marketCap: '$45B+'
  },
  { 
    id: 'polygon', 
    name: 'Polygon', 
    icon: '💠',
    fee: '< $0.01',
    status: 'coming soon',
    tps: '7,000+',
    marketCap: '$8B+'
  },
  { 
    id: 'sui', 
    name: 'Sui', 
    icon: '🌊',
    fee: '< $0.01',
    status: 'coming soon',
    tps: '120,000+',
    marketCap: '$1B+'
  },
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    icon: '🟡',
    fee: '~$5',
    status: 'coming soon',
    tps: '7',
    marketCap: '$800B+'
  }
];

interface ChainSelectorProps {
  selectedChain: string;
  onSelectChain: (chain: string) => void;
}

export function ChainSelector({ selectedChain, onSelectChain }: ChainSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h2 className="text-xl font-bold mb-4">Select Network</h2>
      <div className="space-y-3">
        {chains.map((chain) => (
          <motion.button
            key={chain.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => chain.status === 'active' && onSelectChain(chain.id)}
            className={`w-full p-4 rounded-xl flex flex-col transition-colors relative overflow-hidden
              ${selectedChain === chain.id 
                ? 'bg-white/20 text-white' 
                : chain.status === 'coming soon'
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            {/* Chain Header */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{chain.icon}</span>
              <span className="font-semibold">{chain.name}</span>
              {chain.status === 'coming soon' && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full ml-auto">
                  Coming Soon
                </span>
              )}
            </div>

            {/* Chain Details */}
            <div className="grid grid-cols-2 gap-2 text-sm opacity-80">
              <div className="flex items-center gap-1">
                <span className="text-xs">Fee:</span>
                <span className="font-mono">{chain.fee}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">TPS:</span>
                <span className="font-mono">{chain.tps}</span>
              </div>
            </div>

            {/* Market Cap */}
            <div className="text-xs text-right mt-2 text-blue-400">
              MCap: {chain.marketCap}
            </div>

            {/* Hover Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
        ))}
      </div>

      {/* Network Info */}
      <div className="mt-6 p-4 bg-blue-500/10 rounded-xl text-sm">
        <h3 className="font-semibold mb-2">Network Benefits</h3>
        <ul className="space-y-1 text-gray-400">
          <li>• Low transaction fees</li>
          <li>• High scalability</li>
          <li>• Fast finality</li>
          <li>• Strong security</li>
        </ul>
      </div>
    </motion.div>
  );
}