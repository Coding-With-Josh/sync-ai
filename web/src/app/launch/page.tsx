"use client"

import { useState, useMemo } from "react";

import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
// import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin';
import {
  SolflareWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { createAppKit } from "@reown/appkit";
import {
  mainnet,
  arbitrum,
  sepolia,
  AppKitNetwork,
} from "@reown/appkit/networks";
import { motion } from "framer-motion";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";

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

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  sepolia,
  solana,
  solanaTestnet,
  solanaDevnet,
];

// 0. Create the Ethers adapter
const ethersAdapter = new EthersAdapter();

// 1. Create Solana adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// 2. Get projectId from https://cloud.reown.com
const projectId = "14f3352e17f7610fa94ef9c1b8206ba6";

// 4. Create the AppKit instance
const modal = createAppKit({
  adapters: [
    new EthersAdapter(),
    new SolanaAdapter(),
    // new BitcoinAdapter({
    //   network: 'testnet',
    //   defaultProvider: 'rgb'
    // })
  ],
  networks: [mainnet, arbitrum, sepolia, solana, solanaTestnet, solanaDevnet],
  projectId,
  features: {
    analytics: true,
    socials: ["google", "x", "discord", "github"],
    email: true,
    emailShowWallets: true,
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
