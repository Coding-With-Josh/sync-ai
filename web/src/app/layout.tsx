import type { Metadata } from "next";
import { Toaster } from 'sonner';
import { Urbanist } from "next/font/google";
import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { solana, solanaTestnet, solanaDevnet, AppKitNetwork } from '@reown/appkit/networks'
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks'

import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'

import ContextProvider from "@/lib/appkit/context";

import "./globals.css"

const font = Urbanist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "700", "900"],
  // weight: ["100", "300", "400", "700", "900"],
  // weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sync AI - Multichain, Multisig Token Launchpad",
  description: "Sync AI - Multichain, Multisig Launchpad for token launches",
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, sepolia, solana, solanaTestnet, solanaDevnet]

// 0. Create the Ethers adapter
const ethersAdapter = new EthersAdapter()

// 1. Create Solana adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// 2. Get projectId from https://cloud.reown.com
const projectId = '14f3352e17f7610fa94ef9c1b8206ba6'


// 4. Create the AppKit instance
const modal = createAppKit({
  adapters: [ethersAdapter, solanaWeb3JsAdapter],
  networks,
  projectId,
  features: {
    analytics: true,
  }
})
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <html lang="en">
      <body className={font.className}>
      <Toaster position="top-center" theme="dark" />
     {children}
      </body>
    </html>
  );
}
