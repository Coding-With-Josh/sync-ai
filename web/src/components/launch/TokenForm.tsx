import { useState } from "react";

import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import type { Provider } from '@reown/appkit-adapter-solana'
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { z } from "zod";
import { TokenPreview } from "./TokenPreview";

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

export function TokenForm({ selectedChain, formData, setFormData, walletAddress }: TokenFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mintAddress, setMintAddress] = useState<string>('');
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { address } = useAppKitAccount()

  const requestAirdrop = async () => {
    if (!walletAddress) return;
    try {
      const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
      const publicKey = new web3.PublicKey(walletAddress);
      
      toast.loading("Requesting SOL airdrop...");
      const signature = await connection.requestAirdrop(publicKey, 2 * web3.LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature, 'confirmed');
      toast.success("Airdrop successful! Check wallet balance.");
      return true;
    } catch (error) {
      toast.error("Airdrop failed. Try again.");
      return false;
    }
  };

  const getLatestBlockhash = async (connection: web3.Connection) => {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    return { blockhash, lastValidBlockHeight };
  };

  const createSolanaToken = async () => {
    if (!walletAddress || !walletProvider.signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
      const userPublicKey = new web3.PublicKey(walletAddress);
      
      // Check balance first
      const balance = await connection.getBalance(userPublicKey);
      if (balance < web3.LAMPORTS_PER_SOL * 0.5) {
        await requestAirdrop();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const mintKeypair = web3.Keypair.generate();
      const loadingToast = toast.loading("Creating your token...");

      try {
        // Get fresh blockhash
        const { blockhash } = await getLatestBlockhash(connection);
        
        // Create mint account
        const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
        const createAcctTransaction = new web3.Transaction().add(
          web3.SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: token.MINT_SIZE,
            lamports,
            programId: token.TOKEN_PROGRAM_ID
          })
        );

        // Set fresh blockhash and sign
        createAcctTransaction.recentBlockhash = blockhash;
        createAcctTransaction.feePayer = userPublicKey;
        createAcctTransaction.sign(mintKeypair);
        
        // Get user signature with retry logic
        let retries = 3;
        let signedTx;
        while (retries > 0) {
          try {
            signedTx = await walletProvider.signTransaction(createAcctTransaction);
            break;
          } catch (err) {
            console.log(`Retry ${4 - retries} failed:`, err);
            retries--;
            if (retries === 0) throw err;
            // Get fresh blockhash for retry
            const { blockhash: newBlockhash } = await getLatestBlockhash(connection);
            createAcctTransaction.recentBlockhash = newBlockhash;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!signedTx) throw new Error("Failed to sign transaction");

        // Send and confirm with timeout
        const createAcctSignature = await connection.sendRawTransaction(signedTx.serialize());
        const confirmation = await connection.confirmTransaction({
          signature: createAcctSignature,
          blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
        }, 'confirmed');

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
        }

        // Initialize mint
        const initMintTransaction = new web3.Transaction().add(
          token.createInitializeMintInstruction(
            mintKeypair.publicKey,
            parseInt(formData.decimals),
            userPublicKey,
            userPublicKey,
            token.TOKEN_PROGRAM_ID
          )
        );

        initMintTransaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        initMintTransaction.feePayer = userPublicKey;

        const initSignedTx = await walletProvider.signTransaction(initMintTransaction);
        const initSignature = await connection.sendRawTransaction(initSignedTx.serialize());
        await connection.confirmTransaction(initSignature, 'confirmed');

        // Create Associated Token Account
        const associatedTokenAddress = await token.getAssociatedTokenAddress(
          mintKeypair.publicKey,
          userPublicKey
        );

        const createAtaTransaction = new web3.Transaction().add(
          token.createAssociatedTokenAccountInstruction(
            userPublicKey,
            associatedTokenAddress,
            userPublicKey,
            mintKeypair.publicKey
          )
        );

        createAtaTransaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        createAtaTransaction.feePayer = userPublicKey;

        const ataSignedTx = await walletProvider.signTransaction(createAtaTransaction);
        const ataSignature = await connection.sendRawTransaction(ataSignedTx.serialize());
        await connection.confirmTransaction(ataSignature, 'confirmed');

        // Mint initial supply
        if (formData.supply) {
          const mintToTransaction = new web3.Transaction().add(
            token.createMintToInstruction(
              mintKeypair.publicKey,
              associatedTokenAddress,
              userPublicKey,
              BigInt(parseFloat(formData.supply) * Math.pow(10, parseInt(formData.decimals)))
            )
          );

          mintToTransaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
          mintToTransaction.feePayer = userPublicKey;

          const mintToSignedTx = await walletProvider.signTransaction(mintToTransaction);
          const mintToSignature = await connection.sendRawTransaction(mintToSignedTx.serialize());
          await connection.confirmTransaction(mintToSignature, 'confirmed');
        }

        setMintAddress(mintKeypair.publicKey.toString());
        toast.success("Token created successfully!", {
          id: loadingToast,
          description: `Mint address: ${mintKeypair.publicKey.toString()}`
        });

        return mintKeypair.publicKey;

      } catch (error) {
        console.error('Transaction error:', error);
        toast.error("Transaction failed", {
          id: loadingToast,
          description: "Please try again. Make sure you have enough SOL and try refreshing the page."
        });
      }

    } catch (error) {
      console.error('Error creating token:', error);
      toast.error("Failed to create token");
    } finally {
      setIsLoading(false);
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
      
      if (selectedChain === 'solana') {
        await createSolanaToken();
      }
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
    <div className="flex gap-8">
      {/* Your existing form component */}
      <motion.div className="flex-1">
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
                <button
                  onClick={requestAirdrop}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 transition-all mb-4"
                >
                  Request Devnet SOL
                </button>
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
      </motion.div>

       {/* Token Preview with new props */}
       <div className="w-96">
        <TokenPreview
          formData={formData} 
          mintAddress={mintAddress}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
