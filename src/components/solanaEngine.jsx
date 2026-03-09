// Solana Engine - Core wallet and transaction logic
// DEVNET ONLY - Not for production use

import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';

export const RPC_ENDPOINT = 'https://api.devnet.solana.com';
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

const PASSPHRASE = 'DEVNET_ONLY_NOT_PRODUCTION_SAFE_2024';

function encryptKey(secretKey) {
  const bytes = Array.from(secretKey);
  const passBytes = Array.from(new TextEncoder().encode(PASSPHRASE));
  return bytes.map((b, i) => b ^ passBytes[i % passBytes.length]);
}

function decryptKey(encryptedKey) {
  const passBytes = Array.from(new TextEncoder().encode(PASSPHRASE));
  return new Uint8Array(encryptedKey.map((b, i) => b ^ passBytes[i % passBytes.length]));
}

export function createWallet() {
  const keypair = Keypair.generate();
  const encryptedSecret = encryptKey(keypair.secretKey);
  return { publicKey: keypair.publicKey.toBase58(), encryptedSecret };
}

export function getKeypair(walletData) {
  const secret = decryptKey(walletData.encryptedSecret);
  return Keypair.fromSecretKey(secret);
}

export async function getBalance(publicKeyStr) {
  try {
    const pubkey = new PublicKey(publicKeyStr);
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  } catch { return 0; }
}

export async function airdropSOL(publicKeyStr, amount = 1) {
  const pubkey = new PublicKey(publicKeyStr);
  const lamports = Math.min(amount, 2) * LAMPORTS_PER_SOL;
  const sig = await connection.requestAirdrop(pubkey, lamports);
  const latestBlockhash = await connection.getLatestBlockhash('confirmed');
  await connection.confirmTransaction({ signature: sig, ...latestBlockhash }, 'confirmed');
  return sig;
}

export async function sendSOL(fromWalletData, toPublicKeyStr, amountSOL) {
  const fromKeypair = getKeypair(fromWalletData);
  const toPubkey = new PublicKey(toPublicKeyStr);
  const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: fromKeypair.publicKey, toPubkey, lamports })
  );
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromKeypair.publicKey;
  const sig = await sendAndConfirmTransaction(connection, tx, [fromKeypair], { commitment: 'confirmed' });
  return sig;
}

export function truncateAddress(addr, chars = 6) {
  if (!addr) return '';
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function explorerUrl(sig) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}

export function explorerAddressUrl(addr) {
  return `https://explorer.solana.com/address/${addr}?cluster=devnet`;
}
