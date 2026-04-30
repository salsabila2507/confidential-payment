import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ConfidentialPayment contract...");

  const ConfidentialPayment = await ethers.getContractFactory("ConfidentialPayment");
  const contract = await ConfidentialPayment.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ ConfidentialPayment deployed to:", address);
  console.log("📝 Save this address for frontend integration!");
  
  // Verify contract info
  const owner = await contract.owner();
  const name = await contract.name();
  const symbol = await contract.symbol();
  
  console.log("\n📊 Contract Info:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Owner:", owner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
