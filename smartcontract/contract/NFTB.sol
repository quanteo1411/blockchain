// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTB is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("NFTB", "NFTB") {}

    function mint(address to) external onlyOwner {
        _safeMint(to, _nextTokenId);
        _nextTokenId++;
    }
}
