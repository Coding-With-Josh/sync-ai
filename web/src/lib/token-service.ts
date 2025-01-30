import {
    createBurnInstruction,
    createCloseAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createRevokeInstruction,
    createApproveInstruction,
  } from "@solana/spl-token"

  import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
  } from "@solana/web3.js"
  
  export class TokenService {
    constructor(
      private connection: Connection,
      private wallet: PublicKey,
      private programId = TOKEN_PROGRAM_ID
    ) {}
  
    async createToken(
      decimals: number,
      freezeAuthority?: PublicKey
    ) {
      const lamports = await getMinimumBalanceForRentExemptMint(this.connection)
      const mintKeypair = Keypair.generate()
  
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: this.wallet,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: this.programId,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          this.wallet,
          freezeAuthority ?? this.wallet,
          this.programId
        )
      )
  
      return {
        transaction,
        signers: [mintKeypair],
        mint: mintKeypair.publicKey,
      }
    }
  
    async mintTo(
      mint: PublicKey,
      destination: PublicKey,
      amount: number
    ) {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        destination,
        false,
        this.programId
      )
  
      const transaction = new Transaction().add(
        createMintToInstruction(
          mint,
          associatedTokenAddress,
          this.wallet,
          amount,
          [],
          this.programId
        )
      )
  
      return transaction
    }
  
    async burnToken(
      mint: PublicKey,
      account: PublicKey,
      amount: number
    ) {
      const transaction = new Transaction().add(
        createBurnInstruction(
          account,
          mint,
          this.wallet,
          amount,
          [],
          this.programId
        )
      )
  
      return transaction
    }
  
    async transferToken(
      source: PublicKey,
      destination: PublicKey,
      amount: number
    ) {
      const transaction = new Transaction().add(
        createTransferInstruction(
          source,
          destination,
          this.wallet,
          amount,
          [],
          this.programId
        )
      )
  
      return transaction
    }
  
    async closeAccount(account: PublicKey) {
      const transaction = new Transaction().add(
        createCloseAccountInstruction(
          account,
          this.wallet,
          this.wallet,
          [],
          this.programId
        )
      )
  
      return transaction
    }
  
    async delegate(
      account: PublicKey,
      delegate: PublicKey,
      amount: number
    ) {
      const transaction = new Transaction().add(
        createApproveInstruction(
          account,
          delegate,
          this.wallet,
          amount,
          [],
          this.programId
        )
      )
  
      return transaction
    }
  
    async revokeDelegate(account: PublicKey) {
      const transaction = new Transaction().add(
        createRevokeInstruction(
          account,
          this.wallet,
          [],
          this.programId
        )
      )
  
      return transaction
    }
  
    async getTokenBalance(account: PublicKey) {
      return this.connection.getTokenAccountBalance(account)
    }
  
    async getTokenAccounts() {
      const accounts = await this.connection.getTokenAccountsByOwner(
        this.wallet,
        { programId: this.programId }
      )
  
      return accounts.value.map((account) => ({
        pubkey: account.pubkey,
        mint: (account.account.data as any).parsed.info.mint, // Type assertion added
        amount: (account.account.data as any).parsed.info.tokenAmount.amount, // Type assertion added
        decimals: (account.account.data as any).parsed.info.tokenAmount.decimals, // Type assertion added
      }))
    }
  }