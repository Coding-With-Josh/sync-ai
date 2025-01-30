"use client"

import { useState, useMemo } from "react";

import {
  PhantomWalletAdapter as ReownPhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { createAppKit, useAppKitAccount } from "@reown/appkit/react";
import { motion } from "framer-motion";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

import Navbar from "@/components/Navbar";
import Spotlight from "@/components/Spotlight";
import { ChainSelector } from "@/components/launch/ChainSelector";
import { NetworkFees } from "@/components/launch/NetworkFees";
import { TokenForm } from "@/components/launch/TokenForm";
import { TokenPreview } from "@/components/launch/TokenPreview";

interface TokenFormData {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
}

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new ReownPhantomWalletAdapter(), new SolflareWalletAdapter()],
});

const projectId = "14f3352e17f7610fa94ef9c1b8206ba6";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export default function LaunchPage() {
  const { address } = useAppKitAccount();
  const [selectedChain, setSelectedChain] = useState("");
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    supply: "",
    decimals: "18",
  });

  // Setup Solana wallet
  const network = WalletAdapterNetwork.Devnet;

  return (

        <div className="min-h-screen bg-black text-white cursor-default">
          <Navbar />
          <Spotlight />

          <main className="pt-32 px-4 pb-20 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
                Launch Your Token
              </h1>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                Create and deploy your token across multiple blockchains in minutes
              </p>
            </motion.div>
            {!address ? (
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-gray-400 mb-4">
                  Connect Wallet
                </h2>
                <p className="text-gray-500">
                  Please connect your wallet to launch a token
                </p>
                <appkit-button />
              </div>
            ) : (
                <div>
                  <div className="flex justify-end mb-6">
                    <appkit-button />
                  </div>
                    <div className="grid md:grid-cols-[300px_1fr_300px] gap-8">
                      <div className="space-y-8">
                      <ChainSelector
                        selectedChain={selectedChain}
                        onSelectChain={setSelectedChain}
                      />
                      <NetworkFees selectedChain={selectedChain} />
                      </div>

                      <TokenForm
                      selectedChain={selectedChain}
                      formData={formData}
                      setFormData={setFormData}
                      walletAddress={address}
                      />

                      <TokenPreview formData={formData} />
                    </div>
                </div>
            )}
          </main>
        </div>
  );
}
