import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import type { Provider } from '@reown/appkit-adapter-solana';
import { ethers, ContractFactory, Contract } from 'ethers';
import { toast } from "sonner";
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { SendTransactionError } from '@solana/web3.js';

import { ERC20_ABI, ERC20_BYTECODE } from '@/constants/contracts';

// Add type for EIP-1193 provider
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
  on?: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
}
 
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
  const loadingToast = toast.loading("Creating your token...");
  setIsLoading(true);

  try {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), {
      commitment: 'processed',
      confirmTransactionInitialTimeout: 60000
    });

    const userPublicKey = new web3.PublicKey(walletAddress);
    const mintKeypair = web3.Keypair.generate();

    // Function to get fresh blockhash and build transaction
    const buildTransaction = async (instruction: web3.TransactionInstruction) => {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      const tx = new web3.Transaction().add(instruction);
      tx.recentBlockhash = blockhash;
      tx.feePayer = userPublicKey;
      return { tx, blockhash, lastValidBlockHeight };
    };

    // Function to send and confirm transaction
    const sendAndConfirmTx = async (transaction: web3.Transaction, signers: web3.Signer[] = []) => {
      try {
        // Sign with additional signers if any
        if (signers.length > 0) {
          transaction.sign(...signers);
        }

        // Sign with wallet
        const signedTx = await walletProvider.signTransaction(transaction);
        
        // Send transaction
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'processed'
        });

        // Confirm transaction
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash: transaction.recentBlockhash!,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
        }, 'confirmed');

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        return signature;
      } catch (error) {
        if (error instanceof SendTransactionError) {
          console.error('Transaction error logs:', error.logs);
          throw new Error(`Transaction failed: ${error.message}`);
        }
        throw error;
      }
    };

    // 1. Create mint account
    console.log('Creating mint account...');
    const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
    const { tx: createAcctTx } = await buildTransaction(
      web3.SystemProgram.createAccount({
        fromPubkey: userPublicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: token.MINT_SIZE,
        lamports,
        programId: token.TOKEN_PROGRAM_ID,
      })
    );
    await sendAndConfirmTx(createAcctTx, [mintKeypair]);

    // 2. Initialize mint
    console.log('Initializing mint...');
    const { tx: initMintTx } = await buildTransaction(
      token.createInitializeMintInstruction(
        mintKeypair.publicKey,
        parseInt(formData.decimals),
        userPublicKey,
        userPublicKey,
        token.TOKEN_PROGRAM_ID
      )
    );
    await sendAndConfirmTx(initMintTx);

    // 3. Create Associated Token Account
    console.log('Creating token account...');
    const associatedTokenAddress = await token.getAssociatedTokenAddress(
      mintKeypair.publicKey,
      userPublicKey
    );
    const { tx: createAtaTx } = await buildTransaction(
      token.createAssociatedTokenAccountInstruction(
        userPublicKey,
        associatedTokenAddress,
        userPublicKey,
        mintKeypair.publicKey
      )
    );
    await sendAndConfirmTx(createAtaTx);

    // 4. Mint tokens
    console.log('Minting tokens...');
    const { tx: mintTx } = await buildTransaction(
      token.createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAddress,
        userPublicKey,
        BigInt(parseFloat(formData.supply) * Math.pow(10, parseInt(formData.decimals)))
      )
    );
    await sendAndConfirmTx(mintTx);

    setMintAddress(mintKeypair.publicKey.toString());
    toast.success("Token created successfully!", {
      id: loadingToast,
      description: `Mint address: ${mintKeypair.publicKey.toString()}`
    });

    return mintKeypair.publicKey;

  } catch (error: any) {
    console.error('Detailed error:', error);
    toast.error("Transaction failed", {
      id: loadingToast,
      description: error.message || "Please try again"
    });
    return null;
  } finally {
    setIsLoading(false);
  }
};

export const createEthereumToken = async (
  provider: EthereumProvider,
  formData: { name: string; symbol: string; decimals: string; supply: string },
  setMintAddress: (address: string) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const loadingToast = toast.loading("Creating your token...");
  setIsLoading(true);

  try {
    // First check if provider is properly connected
    if (!provider || !provider.request) {
      throw new Error("Provider not properly initialized");
    }

    // Request account access first
    await provider.request({ method: 'eth_requestAccounts' });

    // Check network connection
    const chainId = await provider.request({ method: 'eth_chainId' });
    console.log('Connected to chain:', chainId);

    // Create provider and signer
    const ethersProvider = new ethers.BrowserProvider(provider, 'any');
    const signer = await ethersProvider.getSigner();

    // Verify account
    const address = await signer.getAddress();
    if (!address) {
      throw new Error("No account found");
    }

    // Check balance with error handling
    let balance;
    try {
      balance = await ethersProvider.getBalance(address);
    } catch (error) {
      console.error("Balance check failed:", error);
      throw new Error("Could not verify balance. Please check your network connection.");
    }

    if (balance < ethers.parseEther("0.01")) {
      toast.error("Insufficient ETH balance", {
        description: "You need at least 0.01 ETH to deploy a token"
      });
      return null;
    }

    // Deploy contract with proper typing
    const factory = new ContractFactory(
      ERC20_ABI,
      ERC20_BYTECODE,
      signer
    ) as ethers.ContractFactory;

    const deploymentPromise = factory.deploy(
      formData.name,
      formData.symbol,
      parseInt(formData.decimals),
      ethers.parseUnits(formData.supply, parseInt(formData.decimals))
    ) as Promise<Contract>;

    // Add timeout to deployment
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Deployment timeout")), 60000); // 1 minute timeout
    });

    const contract = await Promise.race([deploymentPromise, timeoutPromise]) as Contract;
    const deployedContract = await contract.waitForDeployment();
    const contractAddress = await deployedContract.getAddress();  
    
    setMintAddress(contractAddress);
    
    toast.success("Token created successfully!", {
      id: loadingToast,
      description: `Contract address: ${contractAddress}`
    });

    return contractAddress;

  } catch (error: any) {
    console.error('Error creating token:', error);
    
    // Handle specific error types
    const errorMessage = error.code === 'ACTION_REJECTED' 
      ? 'Transaction was rejected by user'
      : error.code === 'INSUFFICIENT_FUNDS'
      ? 'Insufficient funds for token deployment'
      : error.message || "Failed to create token";

    toast.error("Failed to create token", {
      id: loadingToast,
      description: errorMessage
    });
    return null;
  } finally {
    setIsLoading(false);
  }
};
