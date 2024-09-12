const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking System", function () {
  let TokenA, CertificateNFT, StakingContract;
  let tokenA, nft, stakingContract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    // Deploy TokenA contract
    TokenA = await ethers.getContractFactory("TokenA");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    tokenA = await TokenA.deploy();
    await tokenA.deployed();

    // Deploy CertificateNFT contract
    CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    nft = await CertificateNFT.deploy();
    await nft.deployed();

    // Deploy StakingContract
    StakingContract = await ethers.getContractFactory("StakingContract");
    stakingContract = await StakingContract.deploy(tokenA.address, nft.address);
    await stakingContract.deployed();

    // Mint some tokens to addr1 for testing
    await tokenA.transfer(addr1.address, ethers.utils.parseUnits("2000000", 18));
  });

  describe("TokenA (ERC20) Tests", function () {
    it("should have the correct name and symbol", async function () {
      expect(await tokenA.name()).to.equal("TokenA");
      expect(await tokenA.symbol()).to.equal("TKA");
    });

    it("should have a maximum supply of 1 billion tokens", async function () {
      const maxSupply = await tokenA.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.utils.parseUnits("1000000000", 18));
    });

    it("should mint the total supply to the owner", async function () {
      const totalSupply = await tokenA.totalSupply();
      expect(await tokenA.balanceOf(owner.address)).to.equal(totalSupply);
    });

    it("should not allow minting more than the max supply", async function () {
      await expect(tokenA.mint(addr1.address, ethers.utils.parseUnits("1000", 18)))
        .to.be.revertedWith("Exceeds maximum supply");
    });
  });

  describe("CertificateNFT (ERC721) Tests", function () {
    it("should mint an NFT to an address", async function () {
      await nft.mint(addr1.address);
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
    });

    it("should not allow non-owner to mint NFT", async function () {
      await expect(nft.connect(addr1).mint(addr1.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("StakingContract Tests", function () {
    it("should allow deposit of tokens", async function () {
      await tokenA.connect(addr1).approve(stakingContract.address, ethers.utils.parseUnits("1000000", 18));
      await stakingContract.connect(addr1).deposit(ethers.utils.parseUnits("1000000", 18));

      const stake = await stakingContract.stakes(addr1.address);
      expect(stake.amount).to.equal(ethers.utils.parseUnits("1000000", 18));
    });

    it("should issue NFT when deposit exceeds 1 million tokens", async function () {
      await tokenA.connect(addr1).approve(stakingContract.address, ethers.utils.parseUnits("2000000", 18));
      await stakingContract.connect(addr1).deposit(ethers.utils.parseUnits("2000000", 18));

      expect(await nft.ownerOf(0)).to.equal(addr1.address);
    });

    it("should not allow withdraw if tokens are locked", async function () {
      await tokenA.connect(addr1).approve(stakingContract.address, ethers.utils.parseUnits("1000000", 18));
      await stakingContract.connect(addr1).deposit(ethers.utils.parseUnits("1000000", 18));

      await expect(stakingContract.connect(addr1).withdraw(ethers.utils.parseUnits("1000000", 18)))
        .to.be.revertedWith("Tokens are locked");
    });

    it("should allow withdraw after lock period", async function () {
      await tokenA.connect(addr1).approve(stakingContract.address, ethers.utils.parseUnits("1000000", 18));
      await stakingContract.connect(addr1).deposit(ethers.utils.parseUnits("1000000", 18));

      // Fast-forward time to bypass lock
      await ethers.provider.send("evm_increaseTime", [300]); // 5 minutes
      await ethers.provider.send("evm_mine", []);

      await stakingContract.connect(addr1).withdraw(ethers.utils.parseUnits("1000000", 18));
      const stake = await stakingContract.stakes(addr1.address);
      expect(stake.amount).to.equal(0);
    });

    it("should allow claiming rewards", async function () {
      await tokenA.connect(addr1).approve(stakingContract.address, ethers.utils.parseUnits("1000000", 18));
      await stakingContract.connect(addr1).deposit(ethers.utils.parseUnits("1000000", 18));

      // Fast-forward time to simulate reward accumulation
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine", []);

      const rewardBefore = await tokenA.balanceOf(addr1.address);
      await stakingContract.connect(addr1).claimReward();
      const rewardAfter = await tokenA.balanceOf(addr1.address);

      expect(rewardAfter).to.be.gt(rewardBefore);
    });

    it("should allow user to claim reward without withdrawing tokens", async function () {
      await tokenA.connect(addr1).approve(stakingContract.address, ethers.utils.parseUnits("1000000", 18));
      await stakingContract.connect(addr1).deposit(ethers.utils.parseUnits("1000000", 18));

      // Fast-forward time to simulate reward accumulation
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine", []);

      const rewardBefore = await tokenA.balanceOf(addr1.address);
      await stakingContract.connect(addr1).claimReward();
      const rewardAfter = await tokenA.balanceOf(addr1.address);

      expect(rewardAfter).to.be.gt(rewardBefore);
    });

    it("should correctly display the history of transactions", async function () {
      // Deposit, claim rewards, and withdraw
      await tokenA.connect(addr1).approve(stakingContract.address, ethers.utils.parseUnits("1000000", 18));
      await stakingContract.connect(addr1).deposit(ethers.utils.parseUnits("1000000", 18));
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine", []);
      await stakingContract.connect(addr1).claimReward();
      await stakingContract.connect(addr1).withdraw(ethers.utils.parseUnits("1000000", 18));

      // Retrieve transaction history
      const history = await stakingContract.getTransactionHistory(addr1.address);
      expect(history.length).to.be.gt(0); // Check if there is at least one transaction

      // Validate the latest transaction
      const latestTx = history[history.length - 1];
      expect(latestTx.action).to.equal("withdraw");
      expect(latestTx.amount.toString()).to.equal(ethers.utils.parseUnits("1000000", 18).toString());
    });
  });
});
