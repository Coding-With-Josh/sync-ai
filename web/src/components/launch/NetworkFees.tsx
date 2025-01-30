import { motion } from 'framer-motion';

interface NetworkFeesProps {
  selectedChain: string;
}

export function NetworkFees({ selectedChain }: NetworkFeesProps) {
  const networkFees = {
    ethereum: { 
      deploy: '0.05 ETH',
      approve: '0.02 ETH',
      estimate: '$150-200'
    },
    arbitrum: { 
      deploy: '0.002 ETH',
      approve: '0.001 ETH',
      estimate: '$5-10'
    },
    polygon: { 
      deploy: '50 MATIC',
      approve: '20 MATIC',
      estimate: '$2-5'
    },
    bsc: {
      deploy: '0.01 BNB',
      approve: '0.005 BNB',
      estimate: '$3-6'
    },
    optimism: {
      deploy: '0.001 ETH',
      approve: '0.0005 ETH',
      estimate: '$2-4'
    }
  };

  const fees = networkFees[selectedChain as keyof typeof networkFees] || { 
    deploy: '---', 
    approve: '---',
    estimate: '---'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-lg"
    >
      <h3 className="text-xl font-bold mb-6">Estimated Fees</h3>
      
      <div className="space-y-4">
        <motion.div 
          className="p-4 bg-white/5 rounded-xl space-y-1"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-gray-400">Contract Deployment</div>
          <div className="font-mono">{fees.deploy}</div>
        </motion.div>

        <motion.div 
          className="p-4 bg-white/5 rounded-xl space-y-1"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-gray-400">LP Approval</div>
          <div className="font-mono">{fees.approve}</div>
        </motion.div>

        <div className="p-4 bg-blue-500/10 rounded-xl mt-4">
          <div className="text-sm text-gray-400 mb-2">Estimated USD</div>
          <div className="font-mono text-blue-400">{fees.estimate}</div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          * Fees may vary based on network conditions and gas prices
        </p>
      </div>
    </motion.div>
  );
}