// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenA is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 tỷ token A với 18 decimal

    constructor() ERC20("TokenA", "TKA") {
        _mint(msg.sender, MAX_SUPPLY); // Mint tổng cung 1 tỷ token cho chủ sở hữu hợp đồng
    }

    // Bảo vệ không cho phép mint thêm nếu vượt quá tổng cung
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }
}
