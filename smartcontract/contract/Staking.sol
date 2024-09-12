// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFTB.sol";

contract Staking is Ownable {
    IERC20 public tokenA;
    CertificateNFT public nft;
    uint256 public apr = 8; // APR là 8%
    uint256 public constant SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
    uint256 public lockDuration = 5 * 60; // Lock token trong 5 phút
    uint256 public constant MINIMUM_FOR_NFT = 1_000_000 * 10**18; // 1 triệu token A

    struct Stake {
        uint256 amount;
        uint256 depositTime;
        uint256 lastClaimTime;
    }

    struct Transaction {
        uint256 timestamp;
        string action; // "deposit", "withdraw", "claim"
        uint256 amount;
    }

    mapping(address => Stake) public stakes;
    mapping(address => Transaction[]) public transactions;  // Lưu lịch sử giao dịch theo địa chỉ user

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event ClaimReward(address indexed user, uint256 reward);
    event NFTAwarded(address indexed user);

    constructor(address _tokenA, address _nftAddress) {
        tokenA = IERC20(_tokenA);
        nft = CertificateNFT(_nftAddress);
    }

    // Deposit token A vào smart contract
    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");

        tokenA.transferFrom(msg.sender, address(this), _amount);

        if (stakes[msg.sender].amount > 0) {
            _claimReward();  // Khi deposit tiếp, tính toán và gửi phần thưởng trước đó
        }

        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].depositTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;

        // Lưu lịch sử giao dịch
        transactions[msg.sender].push(Transaction(block.timestamp, "deposit", _amount));

        // Kiểm tra nếu deposit trên 1 triệu token, cấp NFT
        if (_amount >= MINIMUM_FOR_NFT) {
            nft.mint(msg.sender);
            emit NFTAwarded(msg.sender);
        }

        emit Deposit(msg.sender, _amount);
    }

    // Withdraw token A gốc và phần thưởng
    function withdraw(uint256 _amount) external {
        require(stakes[msg.sender].amount >= _amount, "Insufficient balance");
        require(block.timestamp >= stakes[msg.sender].depositTime + lockDuration, "Tokens are locked");

        _claimReward();  // Khi withdraw, claim phần thưởng

        stakes[msg.sender].amount -= _amount;
        tokenA.transfer(msg.sender, _amount);

        // Lưu lịch sử giao dịch
        transactions[msg.sender].push(Transaction(block.timestamp, "withdraw", _amount));

        emit Withdraw(msg.sender, _amount);
    }

    // Claim phần thưởng mà không rút token A gốc
    function claimReward() external {
        require(stakes[msg.sender].amount > 0, "No tokens staked");

        uint256 reward = _claimReward();  // Chỉ claim phần thưởng mà không ảnh hưởng đến số token gốc

        // Lưu lịch sử giao dịch
        transactions[msg.sender].push(Transaction(block.timestamp, "claim", reward));
    }

    // Tính toán phần thưởng dựa trên APR
    function calculateReward(address _user) public view returns (uint256) {
        Stake storage userStake = stakes[_user];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 reward = (userStake.amount * apr * timeStaked) / (100 * SECONDS_IN_YEAR);
        return reward;
    }

    // Internal function để claim phần thưởng
    function _claimReward() internal returns (uint256) {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            tokenA.transfer(msg.sender, reward);
            stakes[msg.sender].lastClaimTime = block.timestamp;
            emit ClaimReward(msg.sender, reward);
        }
        return reward;
    }

    // Phân trang lịch sử giao dịch
    function getTransactionHistory(address _user, uint256 page, uint256 limit) external view returns (Transaction[] memory) {
        require(page > 0 && limit > 0, "Invalid page or limit");

        uint256 start = (page - 1) * limit;
        uint256 end = start + limit;

        uint256 totalTransactions = transactions[_user].length;
        if (end > totalTransactions) {
            end = totalTransactions;
        }

        uint256 count = end - start;
        Transaction[] memory pageTransactions = new Transaction[](count);

        for (uint256 i = 0; i < count; i++) {
            pageTransactions[i] = transactions[_user][start + i];
        }

        return pageTransactions;
    }

    // Cho phép chủ sở hữu cập nhật APR
    function updateAPR(uint256 _apr) external onlyOwner {
        apr = _apr;
    }

    // Cho phép chủ sở hữu cập nhật thời gian lock
    function updateLockDuration(uint256 _lockDuration) external onlyOwner {
        lockDuration = _lockDuration;
    }
}
