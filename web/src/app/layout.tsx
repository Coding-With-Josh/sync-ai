import type { Metadata } from "next";
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { Toaster } from 'sonner';
import { Urbanist } from "next/font/google";
import { createAppKit } from "@reown/appkit";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// 1. Get projectId from https://cloud.reown.com
// const projectId = process.env.APPKIT_PROJECT_ID
const projectId = "14f3352e17f7610fa94ef9c1b8206ba6"

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// // 2. Create a metadata object - optional
// const metadata = {
//   name: 'Sync AI',
//   description: 'AppKit Solana Example',
//   url: 'https://example.com', // origin must match your domain & subdomain
//   icons: ['https://avatars.githubusercontent.com/u/179229932']
// }

// 3. Create modal
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

  return (
    <html lang="en">
      <body className={font.className}>
      <Toaster position="top-center" theme="dark" />
     {children}
      </body>
    </html>
  );
}
