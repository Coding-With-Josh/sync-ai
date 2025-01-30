import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface TokenPreviewProps {
  formData: {
    name: string;
    symbol: string;
    supply: string;
    taxFee?: string;
    liquidityFee?: string;
  };
  mintAddress?: string;
  isLoading?: boolean;
}

export function TokenPreview({ formData, mintAddress, isLoading }: TokenPreviewProps) {
  const data = [
    { name: 'Liquidity Pool',
      //  value: parseFloat(formData.liquidityFee) || 0 
      },
    { name: 'Tax Fee', 
      // value: parseFloat(formData.taxFee) || 0 
    },
    { name: 'Circulating', 
      // value: 100 - (parseFloat(formData.liquidityFee) || 0) - (parseFloat(formData.taxFee) || 0)
       }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#6366F1'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-lg sticky top-32"
    >
      <h3 className="text-xl font-bold mb-6">Token Preview</h3>
      
      <div className="space-y-8">
        {/* Token Identity */}
        <motion.div 
          className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold">
            {formData.symbol?.[0] || '?'}
          </div>
          <div>
            <h4 className="font-bold">{formData.name || 'Your Token'}</h4>
            <p className="text-sm text-gray-400">{formData.symbol || 'SYMBOL'}</p>
          </div>
        </motion.div>

        {/* Token Distribution Chart */}
        <div className="h-[200px] -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index]} 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  borderRadius: '8px',
                  paddingTop: '8px',
                  paddingBottom: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Details */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <motion.div
              key={index}
              className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5"
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }} 
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-mono">5%</span>
            </motion.div>
          ))}
        </div>

        {/* Supply Information */}
        <div className="p-4 bg-white/5 rounded-xl">
          <h4 className="text-sm text-gray-400 mb-2">Total Supply</h4>
          <p className="font-mono text-lg">
            {formData.supply ? parseInt(formData.supply).toLocaleString() : '0'}
          </p>
        </div>

        {/* Add Token Status after Supply Information */}
        <div className="p-4 bg-white/5 rounded-xl mt-4">
          <h4 className="text-sm text-gray-400 mb-2">Token Status</h4>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-sm">Creating token...</p>
            </div>
          ) : mintAddress ? (
            <div className="space-y-2">
              <p className="text-sm text-green-400">✓ Token Created</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs font-mono text-gray-400 truncate">{mintAddress}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(mintAddress)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Ready to create</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}