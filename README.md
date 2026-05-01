# Confidential Payment 🔒

A privacy-preserving ERC20-like token system built with **iExec Nox Protocol** using Fully Homomorphic Encryption (FHE).

## 🎯 What is This?

A confidential payment system where:
- **All balances are encrypted** - no one can see how much you have
- **Transfers are private** - transaction amounts are hidden
- **Only you can decrypt** - ACL-protected balance viewing
- **Fully on-chain** - all operations happen on encrypted data

## 🏗️ Architecture

### Smart Contract (`contracts/ConfidentialPayment.sol`)
- Confidential ERC20-like token
- Encrypted balances using `euint256` from Nox SDK
- Functions:
  - `mint(address, encryptedAmount)` - Owner mints encrypted tokens
  - `transfer(address, encryptedAmount)` - Transfer encrypted amounts
  - `getBalance(address)` - Get encrypted balance (ACL protected)

### Frontend (`frontend/`)
- React + Vite + TypeScript
- Ethers.js v6 for blockchain interaction
- `@iexec-nox/handle` SDK for encryption/decryption
- MetaMask integration

## 🚀 Quick Start

### 1. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` in root:
```env
PRIVATE_KEY=your_private_key_here
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
```

### 3. Compile Contract

```bash
npx hardhat compile
```

### 4. Deploy to Arbitrum Sepolia

```bash
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 🔐 How It Works

### Encryption Flow
1. **User encrypts input** → `handleClient.encryptInput(amount)`
2. **Get handle + proof** → Send to Handle Gateway
3. **Submit to contract** → Contract verifies and operates on encrypted data
4. **Decrypt result** → Only authorized users can decrypt via ACL

### Smart Contract Operations

```solidity
// Mint encrypted tokens (owner only)
function mint(address to, externalEuint256 calldata encryptedAmount)

// Transfer encrypted tokens
function transfer(address to, externalEuint256 calldata encryptedAmount)

// Get encrypted balance (ACL protected)
function getBalance(address account) returns (euint256)
```

### Frontend Integration

```typescript
import { createEthersHandleClient } from '@iexec-nox/handle';

// Initialize Handle client
const handleClient = await createEthersHandleClient(signer);

// Encrypt amount
const { handle, handleProof } = await handleClient.encryptInput(amount);

// Send to contract
await contract.transfer(recipient, { handle, handleProof });

// Decrypt balance (if you have permission)
const encryptedBalance = await contract.getBalance(myAddress);
const decryptedBalance = await handleClient.decrypt(encryptedBalance);
```

## 📦 Tech Stack

- **Blockchain:** Arbitrum Sepolia (testnet)
- **FHE:** iExec Nox Protocol
- **Smart Contracts:** Solidity 0.8.24
- **Framework:** Hardhat
- **Frontend:** React + Vite + TypeScript
- **Web3:** Ethers.js v6

## 🔗 Resources

- [iExec Nox Protocol Docs](https://docs.iex.ec/for-developers/confidential-computing/nox-protocol)
- [Nox SDK Reference](https://github.com/iExecBlockchainComputing/nox-protocol-contracts)
- [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/)

## 📝 License

MIT

## 🤝 Contributing

This is a demo project. Feel free to fork and experiment!

---

**Built with 👑 by 0xyas**
