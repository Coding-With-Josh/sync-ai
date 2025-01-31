import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import type { Provider } from '@reown/appkit-adapter-solana';
import { ethers } from 'ethers';
import { toast } from "sonner";
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { ERC20_ABI, ERC20_BYTECODE } from '@/constants/contracts';


const getLatestBlockhash = async (connection: web3.Connection) => {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    return { blockhash, lastValidBlockHeight };
};

export const requestSolanaAirdrop = async (walletAddress: string) => {
  if (!walletAddress) return false;
  try {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    const publicKey = new web3.PublicKey(walletAddress);
    
    toast.loading("Requesting SOL airdrop...");
    const signature = await connection.requestAirdrop(publicKey, 2 * web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature, 'confirmed');
    toast.success("Airdrop successful!");
    return true;
  } catch (error) {
    toast.error("Airdrop failed. Try again.");
    return false;
  }
};

export const createSolanaToken = async (
  walletAddress: string,
  walletProvider: Provider,
  formData: { name: string; symbol: string; decimals: string; supply: string },
  setMintAddress,
  setIsLoading
) => {
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
        await requestSolanaAirdrop(walletAddress);
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
            programId: token.TOKEN_PROGRAM_ID,
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

  export const createEthereumToken = async (
    provider: any,
    formData: { name: string; symbol: string; decimals: string; supply: string },
    setMintAddress: (address: string) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    const loadingToast = toast.loading("Creating your token...");
    setIsLoading(true);

  try {
    // Updated for ethers v6
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Check network
    const network = await ethersProvider.getNetwork();
    console.log('Connected to network:', network.name);

    // Check balance
    const balance = await ethersProvider.getBalance(await signer.getAddress());
    if (balance < ethers.parseEther("0.01")) {
      toast.error("Insufficient ETH balance", {
        description: "You need at least 0.01 ETH to deploy a token"
      });
      return null;
    }

    // Deploy contract
    const factory = new ethers.ContractFactory(
      ERC20_ABI,
      ERC20_BYTECODE,
      signer
    );

    const contract = await factory.deploy(
      formData.name,
      formData.symbol,
      parseInt(formData.decimals),
      ethers.parseUnits(formData.supply, parseInt(formData.decimals))
    );

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    setMintAddress(contractAddress);
    toast.success("Token created successfully!", {
      id: loadingToast,
      description: `Contract address: ${contractAddress}`
    });

    return contractAddress;
  } catch (error: any) {
    console.error('Error creating token:', error);
    toast.error("Failed to create token", {
      id: loadingToast,
      description: error.message || "Transaction failed"
    });
    return null;
  } finally {
    setIsLoading(false);
  }
};
