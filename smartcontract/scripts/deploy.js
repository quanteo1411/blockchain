const path = require("path");
const { ethers, network } = require("hardhat");

async function main() {
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      " gets automatically created and destroyed every time. Use the Hardhat" +
      " option '--network localhost'"
    );
    // Optionally, you can exit the process here if you don't want to proceed
    // return;
  }

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  try {
    // Deploy TokenA
    console.log("Deploying TokenA...");
    const TokenA = await ethers.getContractFactory("TokenA");
    const tokenA = await TokenA.deploy();
    await tokenA.deployed();
    console.log("Token A address: ", tokenA.address);

    // Deploy NFTB
    console.log("Deploying NFTB...");
    const NFTB = await ethers.getContractFactory("NFTB");
    const nftB = await NFTB.deploy();
    await nftB.deployed();
    console.log("NFT B address: ", nftB.address);

    // Deploy Staking
    console.log("Deploying Staking...");
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(tokenA.address, nftB.address);
    await staking.deployed();
    console.log("Staking contract address: ", staking.address);

    // Set Staking contract in TokenA
    await tokenA.setStakingContract(staking.address);
    console.log("Staking contract set in TokenA");

    // Save frontend and backend files
    console.log("Saving files to backend and frontend...");
    saveFrontendFiles({
      TokenA: tokenA.address,
      NFTB: nftB.address,
      Staking: staking.address,
    });

    console.log("Deployment completed successfully.");
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

function saveFrontendFiles(addresses) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(addresses, undefined, 2)
  );

  const beContractDir = path.join(__dirname, "..", "..", "backend", "src", "contracts");

  if (!fs.existsSync(beContractDir)) {
    fs.mkdirSync(beContractDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(beContractDir, "contract-address.json"),
    JSON.stringify(addresses, undefined, 2)
  );

  const myartifacts = [
    "TokenA",
    "NFTB",
    "Staking",
  ];

  myartifacts.forEach(artifact => {
    const ContractArtifact = artifacts.readArtifactSync(artifact);
    fs.writeFileSync(
      path.join(contractsDir, `${artifact}.json`),
      JSON.stringify(ContractArtifact, null, 2)
    );
    fs.writeFileSync(
      path.join(beContractDir, `${artifact}.json`),
      JSON.stringify(ContractArtifact, null, 2)
    );
  });

  console.log("Contract artifacts and addresses saved successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error during deployment:", error);
    process.exit(1);
  });
