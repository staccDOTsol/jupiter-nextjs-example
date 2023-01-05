import { Cluster } from "@solana/web3.js";
import { ENV as ENVChainId } from "@solana/spl-token-registry";

// Endpoints, connection
export const ENV: Cluster =
  (process.env.NEXT_PUBLIC_CLUSTER as Cluster) || "mainnet-beta";
export const CHAIN_ID =
  ENV === "mainnet-beta"
    ? ENVChainId.MainnetBeta
    : ENV === "devnet"
    ? ENVChainId.Devnet
    : ENV === "testnet"
    ? ENVChainId.Testnet
    : ENVChainId.MainnetBeta;
export const SOLANA_RPC_ENDPOINT =
  ENV === "devnet"
    ? "https://rpc.helius.xyz/?api-key=6b1ccd35-ba2d-472a-8f54-9ac2c3c40b8b"
    : "https://rpc.helius.xyz/?api-key=6b1ccd35-ba2d-472a-8f54-9ac2c3c40b8b";

// Token Mints
export const INPUT_MINT_ADDRESS =
  ENV === "devnet"
    ? "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" // SOL
    : "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDC
export const OUTPUT_MINT_ADDRESS =
  ENV === "devnet"
    ? "So11111111111111111111111111111111111111112" // SRM
    : "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT

// Interface
export interface Token {
  chainId: number; // 101,
  address: string; // '8f9s1sUmzUbVZMoMh6bufMueYH1u4BJSM57RCEvuVmFp',
  symbol: string; // 'TRUE',
  name: string; // 'TrueSight',
  decimals: number; // 9,
  logoURI: string; // 'https://i.ibb.co/pKTWrwP/true.jpg',
  tags: string[]; // [ 'utility-token', 'capital-token' ]
}
