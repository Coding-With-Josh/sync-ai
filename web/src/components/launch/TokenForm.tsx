import { useState } from "react";

import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import type { Provider as EthereumProviderAppKit } from '@reown/appkit-adapter-ethers';
import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana';
import { ethers } from 'ethers';
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { z } from "zod";

// import { createSolanaToken, createEthereumToken, requestSolanaAirdrop, createBitcoinToken } from '@/utils/tokenCreation';
import { createSolanaToken, createEthereumToken, requestSolanaAirdrop } from '@/utils/tokenCreation';


const tokenSchema = z.object({
  name: z.string().min(1, "Token name is required"),
  symbol: z.string().min(1, "Token symbol is required").max(5, "Symbol must be 5 characters or less"),
  supply: z.string().min(1, "Supply is required"),
  decimals: z.string().min(1, "Decimals is required"),
});

type FormData = {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
};

type TokenFormProps = {
  selectedChain: string;
  formData: FormData;
  setFormData: (data: FormData) => void;
  walletAddress: string;
};

// Define provider types
interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

type ProviderMessage = { type: string; data: unknown };

interface ProviderConnectInfo {
  chainId: string;
}

// Define compatible provider interface
interface EthereumProviderBase {
  request(args: { method: string; params?: Array<unknown> }): Promise<unknown>;
  on(eventName: string, handler: (param: unknown) => void): void;
  removeListener(eventName: string, handler: (param: unknown) => void): void;
}

// Export the provider type
export type EthereumProvider = EthereumProviderBase & EthereumProviderAppKit;

export function TokenForm({ selectedChain, formData, setFormData, walletAddress }: TokenFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mintAddress, setMintAddress] = useState<string>('');

  
  // Get providers for all chains
  const { walletProvider: solanaProvider } = useAppKitProvider<SolanaProvider>('solana');
  const { walletProvider: ethereumProvider } = useAppKitProvider<EthereumProvider>('eip155');
  // const { walletProvider: bitcoinProvider } = useAppKitProvider('bitcoin' as ChainNamespace);

  const createToken = async () => {
    if (!selectedChain) {
      toast.error("Please select a blockchain network");
      return;
    }

    try {
      let address;
      
      switch (selectedChain) {
        case 'solana':
          if (!solanaProvider) {
            toast.error("Please connect a Solana wallet");
            return;
          }
          address = await createSolanaToken(walletAddress, solanaProvider, formData, setMintAddress, setIsLoading);
          break;
          
        case 'ethereum': {
          if (!ethereumProvider?.request) {
            toast.error("Please connect an Ethereum wallet");
            return;
          }

          try {
            const chainId = await ethereumProvider.request({
              method: 'eth_chainId',
              params: []
            }) as string;

            // if (chainId !== '0x5' && chainId !== '0xaa36a7') {
            //   toast.error("Please connect to a testnet");
            //   return;
            // }

            address = await createEthereumToken(
              ethereumProvider,
              formData,
              setMintAddress,
              setIsLoading
            );
          } catch (error) {
            if (error instanceof Error) {
              toast.error(`Network error: ${error.message}`);
            }
            return;
          }
          break;
        } 

        // case 'bitcoin': {
        //   if (!bitcoinProvider?.request) {
        //     toast.error("Please connect a Bitcoin wallet");
        //     return;
        //   }

        //   try {
        //     address = await createBitcoinToken(
        //       bitcoinProvider,
        //       formData,
        //       setMintAddress,
        //       setIsLoading
        //     );
        //   } catch (error) {
        //     toast.error("Bitcoin network error");
        //     return;
        //   }
        //   break;
        // }
          
        default:
          toast.error("Selected chain not supported yet");
          return;
      }

      if (address) {
        console.log(`Token created on ${selectedChain}:`, address);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error("Failed to create token. Please check your wallet connection.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    try {
      tokenSchema.parse(formData);
      await createToken();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    }
  };

  // Rest of your render logic remains the same
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 rounded-2xl p-8 backdrop-blur-xl cursor-default relative h-fit"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Progress bar */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <motion.div
              key={stepNumber}
              className={`flex-1 h-1 mx-2 rounded-full ${
                step >= stepNumber ? 'bg-blue-500' : 'bg-white/20'
              }`}
              animate={{
                backgroundColor: step >= stepNumber ? '#3B82F6' : 'rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Token Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. My Solana Token"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Token Symbol</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. MST"
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                maxLength={5}
              />
              {errors.symbol && <p className="mt-1 text-sm text-red-500">{errors.symbol}</p>}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Decimals</label>
              <input
                type="number"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. 9"
                value={formData.decimals}
                onChange={(e) => setFormData({...formData, decimals: e.target.value})}
                min="0"
                max="9"
              />
              {errors.decimals && <p className="mt-1 text-sm text-red-500">{errors.decimals}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Initial Supply</label>
              <input
                type="number"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. 1000000"
                value={formData.supply}
                onChange={(e) => setFormData({...formData, supply: e.target.value})}
                min="0"
              />
              {errors.supply && <p className="mt-1 text-sm text-red-500">{errors.supply}</p>}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-blue-500/10 p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-4">Token Summary</h3>
              <div className="space-y-2 text-sm">
                <p>Name: {formData.name}</p>
                <p>Symbol: {formData.symbol}</p>
                <p>Decimals: {formData.decimals}</p>
                <p>Initial Supply: {formData.supply}</p>
              </div>
            </div>
            
            {/* Add Airdrop button */}
            {selectedChain === 'solana' && (
              <button
                onClick={() => requestSolanaAirdrop(walletAddress)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 transition-all mb-4"
              >
                Request Devnet SOL
              </button>
            )}
          </motion.div>
        )}

        <div className="flex justify-between pt-6">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              Back
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors ml-auto"
          >
            {step === 3 ? (isLoading ? "Loading..." : "Create Token") : "Next"}
          </motion.button>
        </div>
      </form>

      {!selectedChain && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <p className="text-xl text-gray-400">Select a network to continue</p>
        </div>
      )}
    </motion.div>
  );
}
