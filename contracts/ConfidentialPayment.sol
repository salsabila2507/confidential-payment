// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

/**
 * @title ConfidentialPayment
 * @notice A confidential ERC20-like token with encrypted balances
 * @dev Uses iExec Nox Protocol for fully homomorphic encryption
 */
contract ConfidentialPayment {
    string public name = "Confidential Payment Token";
    string public symbol = "CPT";
    uint8 public constant decimals = 18;

    address public owner;
    
    // Encrypted balances: address => euint256
    mapping(address => euint256) private balances;
    
    // Total supply (encrypted)
    euint256 private totalSupply;

    event Transfer(address indexed from, address indexed to);
    event Mint(address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalSupply = Nox.toEuint256(0);
    }

    /**
     * @notice Mint encrypted tokens to an address (owner only)
     * @param to Recipient address
     * @param encryptedAmount External encrypted amount (handle + proof)
     */
    function mint(address to, externalEuint256 encryptedAmount, bytes calldata handleProof) external onlyOwner {
        require(to != address(0), "Invalid address");
        
        // Convert external encrypted input to internal euint256
        euint256 amount = Nox.fromExternal(encryptedAmount, handleProof);
        
        // Allow this contract to use the encrypted value
        Nox.allowThis(amount);
        
        // Add to recipient's balance
        euint256 currentBalance = balances[to];
        if (Nox.isInitialized(currentBalance)) {
            balances[to] = Nox.add(currentBalance, amount);
        } else {
            balances[to] = amount;
        }
        
        // Update total supply
        totalSupply = Nox.add(totalSupply, amount);
        
        emit Mint(to);
    }

    /**
     * @notice Transfer encrypted tokens
     * @param to Recipient address
     * @param encryptedAmount External encrypted amount (handle + proof)
     */
    function transfer(address to, externalEuint256 encryptedAmount, bytes calldata handleProof) external {
        require(to != address(0), "Invalid address");
        require(msg.sender != to, "Cannot transfer to self");
        
        // Convert external encrypted input
        euint256 amount = Nox.fromExternal(encryptedAmount, handleProof);
        Nox.allowThis(amount);
        
        // Get sender's balance
        euint256 senderBalance = balances[msg.sender];
        require(Nox.isInitialized(senderBalance), "Insufficient balance");
        
        // Subtract from sender
        balances[msg.sender] = Nox.sub(senderBalance, amount);
        
        // Add to recipient
        euint256 recipientBalance = balances[to];
        if (Nox.isInitialized(recipientBalance)) {
            balances[to] = Nox.add(recipientBalance, amount);
        } else {
            balances[to] = amount;
        }
        
        emit Transfer(msg.sender, to);
    }

    /**
     * @notice Get encrypted balance (ACL protected)
     * @param account Address to query
     * @return Encrypted balance handle
     * @dev Only the account owner can decrypt this value
     */
    function getBalance(address account) external returns (euint256) {
        euint256 balance = balances[account];
        
        // If balance not initialized, return encrypted zero
        if (!Nox.isInitialized(balance)) {
            return Nox.toEuint256(0);
        }
        
        // Allow the account owner to decrypt their balance
        Nox.allow(balance, account);
        
        return balance;
    }

    /**
     * @notice Get total supply (encrypted)
     * @return Encrypted total supply
     */
    function getTotalSupply() external returns (euint256) {
        Nox.allow(totalSupply, msg.sender);
        return totalSupply;
    }

    /**
     * @notice Check if an address has initialized balance
     * @param account Address to check
     * @return true if balance is initialized
     */
    function hasBalance(address account) external view returns (bool) {
        return Nox.isInitialized(balances[account]);
    }
}
