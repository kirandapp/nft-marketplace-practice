// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721Enumerable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct NFT {
        string tokenURI;
        uint256 price;
        bool isForSale;
    }

    mapping(uint256 => NFT) public nfts;

    event NFTMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);
    event NFTListed(address indexed owner, uint256 indexed tokenId, uint256 price);
    event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
    event NFTListingCancelled(address indexed owner, uint256 indexed tokenId);
    event NFTListingEdited(address indexed owner, uint256 indexed tokenId, uint256 newPrice);

    constructor() ERC721("NFTMarketplace", "NFTM") {}

    function mintNFT(string memory _tokenURI) external {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        nfts[newTokenId] = NFT({
            tokenURI: _tokenURI,
            price: 0,
            isForSale: false
        });
        _safeMint(msg.sender, newTokenId);

        emit NFTMinted(msg.sender, newTokenId, _tokenURI);
    }

    function listNFTForSale(uint256 tokenId, uint256 price) external {
        require(msg.sender == ownerOf(tokenId), "Not the owner");
        require(price > 0, "Price should be greater than zero");
        require(nfts[tokenId].isForSale == false, "Already Listed for sale");
        nfts[tokenId].price = price;
        nfts[tokenId].isForSale = true;

        emit NFTListed(msg.sender, tokenId, price);
    }

    function buyNFT(uint256 tokenId) external payable {
        require(nfts[tokenId].isForSale, "Not for sale");
        require(msg.value == nfts[tokenId].price, "Ether value sent is not correct");

        address seller = ownerOf(tokenId);
        address buyer = msg.sender;

        _transfer(seller, buyer, tokenId);
        payable(seller).transfer(msg.value);

        nfts[tokenId].isForSale = false;
        nfts[tokenId].price = 0;

        emit NFTSold(seller, buyer, tokenId, msg.value);
    }

    function cancelListing(uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId), "Not the owner");
        require(nfts[tokenId].isForSale, "NFT is not listed for sale");

        nfts[tokenId].isForSale = false;
        nfts[tokenId].price = 0;

        emit NFTListingCancelled(msg.sender, tokenId);
    }

    function editListing(uint256 tokenId, uint256 newPrice) external {
        require(msg.sender == ownerOf(tokenId), "Not the owner");
        require(nfts[tokenId].isForSale, "NFT is not listed for sale");
        require(newPrice > 0, "Price should be greater than zero");

        nfts[tokenId].price = newPrice;

        emit NFTListingEdited(msg.sender, tokenId, newPrice);
    }

    function viewAllNFTsForSale() external view returns(uint256[] memory) {
        uint256 totalNFTs = _tokenIdCounter.current();
        uint256 forSaleCount = 0;
        for(uint256 i = 1; i <= totalNFTs; i++) {
            if(nfts[i].isForSale) {
                forSaleCount++;
            }
        }

        uint256[] memory nftsForSale = new uint256[](forSaleCount);
        uint256 counter = 0;
        for(uint256 i = 1; i <= totalNFTs; i++) {
            if(nfts[i].isForSale) {
                nftsForSale[counter] = i;
                counter++;
            }
        }

        return nftsForSale;
    }

    function viewOwnedNFTs(address owner) external view returns(uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);

        uint256[] memory result = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        return result;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return nfts[tokenId].tokenURI;
    }
}
