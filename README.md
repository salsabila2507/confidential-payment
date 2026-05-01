# Confidential Payment

A privacy-preserving token transfer system built with iExec Nox Protocol using Fully Homomorphic Encryption (FHE) on Arbitrum Sepolia.

## What is this?

On-chain transactions are public by default — anyone can see balances and transfer amounts. This project changes that. Balances and transfer amounts are fully encrypted on-chain using FHE, so only the authorized parties can read the actual numbers.

- Balances are encrypted — no one can see how much you hold
- Transfer amounts are hidden from public view
- Only the account owner can decrypt their own balance
- Everything runs on-chain, no off-chain workarounds

## Architecture

### Smart Contract (`contracts/ConfidentialPayment.sol`)

An ERC20-like token where balances are stored as `euint256` (encrypted uint256) from the Nox SDK.

- `mint(address, encryptedAmount)` — owner mints encrypted tokens to an address
- `transfer(address, encryptedAmount)` — transfer encrypted tokens
- `getBalance(address)` — returns encrypted balance (ACL protected)

### Frontend (`frontend/`)

React + Vite + TypeScript app with MetaMask integration. Uses `@iexec-nox/handle` for client-side encryption and decryption.

## Getting Started

### Install dependencies

```bash
npm install
```

```bash
cd frontend
npm install
```

### Configure environment

Create `.env` in the root directory:

```env
PRIVATE_KEY=your_private_key_here
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
```

### Compile and deploy

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

### Run the frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## How it works

When you send tokens, the amount is encrypted client-side using the Nox SDK before the transaction is broadcast. The contract operates on the encrypted value — the raw number never appears on-chain.

```typescript
const handleClient = await createEthersHandleClient(signer);

// Encrypt the amount before sending
const { handle, handleProof } = await handleClient.encryptInput(amount);

// Contract receives encrypted data only
await contract.transfer(recipient, { handle, handleProof });

// Decrypt your own balance
const encryptedBalance = await contract.getBalance(myAddress);
const decryptedBalance = await handleClient.decrypt(encryptedBalance);
```

## Tech Stack

- Arbitrum Sepolia (testnet)
- iExec Nox Protocol (FHE)
- Solidity 0.8.27
- Hardhat
- React + Vite + TypeScript
- Ethers.js v6

## Live Demo

- Frontend: https://frontend-one-sigma-14.vercel.app
- Contract: `0x012C94A0278704f069C1BC20822832cd245BbC24` on Arbitrum Sepolia

## License

MIT
