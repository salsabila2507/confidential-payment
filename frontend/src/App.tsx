import { useState } from 'react';
import { ethers } from 'ethers';
import { createEthersHandleClient } from '@iexec-nox/handle';
import contractABI from './contractABI.json';

// Arbitrum Sepolia configuration
const CHAIN_ID = 421614;
const CHAIN_NAME = 'Arbitrum Sepolia';
// const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';

// Contract address - UPDATE THIS after deployment
const CONTRACT_ADDRESS = '0x012C94A0278704f069C1BC20822832cd245BbC24';

interface WindowWithEthereum extends Window {
  ethereum?: any;
}

declare const window: WindowWithEthereum;

function App() {
  const [account, setAccount] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [_provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [handleClient, setHandleClient] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // Form states
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [balance, setBalance] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    try {
      setLoading(true);
      setStatus('Connecting wallet...');
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();
      
      // Check if on correct network
      if (Number(network.chainId) !== CHAIN_ID) {
        setStatus(`Please switch to ${CHAIN_NAME}`);
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            alert(`Please add ${CHAIN_NAME} to MetaMask manually`);
          }
          throw switchError;
        }
      }
      
      const userSigner = await browserProvider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        (contractABI as any).abi ?? contractABI,
        userSigner
      );
      
      // Initialize handle client
      const client = await createEthersHandleClient(userSigner);
      
      // Check if user is owner
      const owner = await contractInstance.owner();
      const isUserOwner = owner.toLowerCase() === accounts[0].toLowerCase();
      
      setProvider(browserProvider);
      setSigner(userSigner);
      setContract(contractInstance);
      setHandleClient(client);
      setAccount(accounts[0]);
      setIsOwner(isUserOwner);
      setConnected(true);
      setStatus('Connected successfully!');
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mintTokens = async () => {
    if (!contract || !handleClient || !signer) return;
    
    try {
      setLoading(true);
      setStatus('Encrypting amount...');
      
      const amount = ethers.parseEther(mintAmount);
      
      // Encrypt the amount
      const { handle, handleProof } = await handleClient
        .encryptInput(amount, 'uint256', CONTRACT_ADDRESS);
      
      setStatus('Minting tokens...');
      const tx = await contract.mint(mintAddress, handle, handleProof);
      
      setStatus('Waiting for confirmation...');
      await tx.wait();
      
      setStatus('Tokens minted successfully!');
      setMintAddress('');
      setMintAmount('');
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error: any) {
      console.error('Mint failed:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const transferTokens = async () => {
    if (!contract || !handleClient || !signer) return;
    
    try {
      setLoading(true);
      setStatus('Encrypting amount...');
      
      const amount = ethers.parseEther(transferAmount);
      
      // Encrypt the amount
      const { handle, handleProof } = await handleClient
        .encryptInput(amount, 'uint256', CONTRACT_ADDRESS);
      
      setStatus('Transferring tokens...');
      const tx = await contract.transfer(transferAddress, handle, handleProof);
      
      setStatus('Waiting for confirmation...');
      await tx.wait();
      
      setStatus('Transfer successful!');
      setTransferAddress('');
      setTransferAmount('');
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error: any) {
      console.error('Transfer failed:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewBalance = async () => {
    if (!contract || !handleClient || !account) return;
    
    try {
      setLoading(true);
      setStatus('Fetching encrypted balance...');
      
      // Get encrypted balance handle via staticCall (nonpayable but we need return value)
      const encryptedBalance = await contract.getBalance.staticCall(account);
      
      setStatus('Decrypting balance...');
      
      // Decrypt the balance
      const decryptedResult = await handleClient.decrypt(encryptedBalance);
      // Nox SDK returns { solidityType, value } object
      const rawValue = typeof decryptedResult === 'object' && decryptedResult !== null && 'value' in decryptedResult
        ? BigInt(decryptedResult.value)
        : BigInt(decryptedResult);
      const balanceInEther = ethers.formatEther(rawValue);
      
      setBalance(balanceInEther);
      setStatus('Balance decrypted successfully!');
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error: any) {
      console.error('Failed to get balance:', error);
      setStatus(`Error: ${error.message}`);
      setBalance('Error fetching balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>
          🔒 Confidential Payment
        </h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Privacy-preserving token transfers using iExec Nox Protocol
        </p>
        
        {/* Status Bar */}
        {status && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: status.includes('Error') ? '#fee' : '#e7f5ff',
            color: status.includes('Error') ? '#c00' : '#0066ff',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            {status}
          </div>
        )}
        
        {/* Connect Wallet */}
        <div style={{ marginTop: '2rem' }}>
          {!connected ? (
            <button 
              onClick={connectWallet}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#ccc' : '#0066ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                width: '100%'
              }}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                  <strong>Connected:</strong> {account.slice(0, 6)}...{account.slice(-4)}
                </p>
                {isOwner && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#0066ff' }}>
                    👑 <strong>Owner Account</strong>
                  </p>
                )}
              </div>

              {/* View Balance */}
              <div style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>💰 Your Balance</h3>
                <button
                  onClick={viewBalance}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  {loading ? 'Loading...' : 'View Balance'}
                </button>
                {balance !== null && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#333'
                  }}>
                    {balance} CPT
                  </div>
                )}
              </div>

              {/* Transfer Tokens */}
              <div style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>📤 Transfer Tokens</h3>
                <input
                  type="text"
                  placeholder="Recipient address (0x...)"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="text"
                  placeholder="Amount (e.g., 100)"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={transferTokens}
                  disabled={loading || !transferAddress || !transferAmount}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    cursor: (loading || !transferAddress || !transferAmount) ? 'not-allowed' : 'pointer',
                    background: (loading || !transferAddress || !transferAmount) ? '#ccc' : '#0066ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  {loading ? 'Processing...' : 'Transfer'}
                </button>
              </div>

              {/* Mint Tokens (Owner Only) */}
              {isOwner && (
                <div style={{
                  padding: '1.5rem',
                  background: '#fff3cd',
                  borderRadius: '8px',
                  border: '2px solid #ffc107'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>👑 Mint Tokens (Owner Only)</h3>
                  <input
                    type="text"
                    placeholder="Recipient address (0x...)"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '0.75rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g., 1000)"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '0.75rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={mintTokens}
                    disabled={loading || !mintAddress || !mintAmount}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      cursor: (loading || !mintAddress || !mintAmount) ? 'not-allowed' : 'pointer',
                      background: (loading || !mintAddress || !mintAmount) ? '#ccc' : '#ffc107',
                      color: '#333',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      width: '100%'
                    }}
                  >
                    {loading ? 'Processing...' : 'Mint Tokens'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}><strong>📚 How it works:</strong></p>
          <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            <li>All balances are encrypted using FHE (Fully Homomorphic Encryption)</li>
            <li>Transfers happen on encrypted values - no one can see amounts</li>
            <li>Only you can decrypt your own balance using ACL permissions</li>
            <li>The iExec Nox Protocol ensures privacy at the protocol level</li>
          </ol>
        </div>

        {/* Contract Info */}
        <div style={{ 
          marginTop: '1rem',
          padding: '1rem',
          background: '#e7f5ff',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#0066ff'
        }}>
          <p style={{ margin: 0 }}>
            <strong>Contract:</strong> {`${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`}
          </p>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            <strong>Network:</strong> {CHAIN_NAME} (Chain ID: {CHAIN_ID})
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
