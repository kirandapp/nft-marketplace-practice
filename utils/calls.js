import { useWeb3React } from "@web3-react/core";
import useContract from "../hooks/useContract";

import ABI from "../contracts/marketplaceABI.json";
const address = process.env.NEXT_PUBLIC_FANTOMTESTNET_MARKETPLACE

export const mintNft = async (connectedWallet, tokenURIInput) => {
    console.log("connectedWallet, tokenURIInput - ",connectedWallet, tokenURIInput);
    let owner, tokenId, tokenURI, price, isForSale
    try{
        let _web3 = window.web3;
        console.log("\n _web3 - ",_web3);
        const contract = new _web3.eth.Contract(ABI, address);
        if (tokenURIInput) {
            const data = await contract.methods.mintNFT(tokenURIInput);
            const result = await _web3.eth.sendTransaction({
                from: connectedWallet,
                to: contract._address,
                data: data.encodeABI(),
            });
            const receipt = await _web3.eth.getTransactionReceipt(result.transactionHash);
            const event = receipt.logs.find(log => log.topics[0] === _web3.utils.keccak256("NFTMinted(address,uint256,string)"));
            
            if (event && event.data) {
                const decodedData = _web3.eth.abi.decodeLog(
                    [
                        {
                            indexed: true,
                            name: 'owner',
                            type: 'address'
                        },
                        {
                            indexed: true,
                            name: 'tokenId',
                            type: 'uint256'
                        },
                        {
                            indexed: false,
                            name: 'tokenURI',
                            type: 'string'
                        }
                    ],
                    event.data,
                    event.topics.slice(1)  // Remove the topic[0] since it's the event signature
                );
                owner = decodedData.owner;
                tokenId = decodedData.tokenId;
                tokenURI = decodedData.tokenURI;
                price = 0;
                isForSale = false;
                console.log("Owner:", owner);
                console.log("Token ID:", tokenId);
                console.log("Token URI:", tokenURI);
            } else {
                console.error("Expected NFTMinted event was not found in the transaction receipt.");
                return null;
            }

            console.log("Result ", result);
            return [Number(tokenId), tokenURI, owner, price, isForSale];
        } else {
            alert("Input field can't be blank.");
            return null;
        }
    } catch(e) {
        throw e;
    }
}

export const buyNft = async (connectedWallet, tokenId, price) => {
    console.log("connectedWallet, tokenId, price - ",connectedWallet, tokenId, price);
    try {
        let _web3 = window.web3;
        console.log("\n _web3 - ",_web3);
        const contract = new _web3.eth.Contract(ABI, address);
        if (tokenId && price) {
            const data = await contract.methods.buyNFT(tokenId);
            const result = await _web3.eth.sendTransaction({
                from: connectedWallet,
                to: contract._address,
                data: data.encodeABI(),
                value: price,
            });
            console.log("buy result ", result);
        } else {
            alert("Input tokenId field can't be blank.");
        }
    } catch(e) {
        throw e;
    }
}

export const listNft = async (connectedWallet, tokenId, price) => {
    console.log("connectedWallet, tokenId, price - ",connectedWallet, tokenId, price);
    try {
        let _web3 = window.web3;
        console.log("\n _web3 - ",_web3);
        const contract = new _web3.eth.Contract(ABI, address);
        if (tokenId && price) {
            const nftids = await contract.methods.viewAllNFTsForSale().call() ;
            console.log("nftids - ",nftids);
            const data = await contract.methods.listNFTForSale(tokenId, price);
            const result = await _web3.eth.sendTransaction({
                from: connectedWallet,
                to: contract._address,
                data: data.encodeABI(),
            });
            console.log("list nft result ", result);
        } else {
            alert("Input tokenId and price field can't be blank.");
        }
    } catch(e) {
        throw e;
    }
}

export const editListing = async (connectedWallet, tokenId, price) => {
    console.log("connectedWallet, tokenId, price - ",connectedWallet, tokenId, price);
    try {
        let _web3 = window.web3;
        console.log("\n _web3 - ",_web3);
        const contract = new _web3.eth.Contract(ABI, address);
        if (tokenId && price) {
            const data = await contract.methods.editListing(tokenId, price);
            const result = await _web3.eth.sendTransaction({
                from: connectedWallet,
                to: contract._address,
                data: data.encodeABI(),
            });
            console.log("Edited Listed nft result ", result);
        } else {
            alert("Input tokenId and price field can't be blank.");
        }
    } catch(e) {
        throw e;
    }
}

export const cancelListing = async (connectedWallet, tokenId) => {
    console.log("connectedWallet, tokenId - ",connectedWallet, tokenId);
    try {
        let _web3 = window.web3;
        console.log("\n _web3 - ",_web3);
        const contract = new _web3.eth.Contract(ABI, address);
        if (tokenId) {
            const data = await contract.methods.cancelListing(tokenId);
            const result = await _web3.eth.sendTransaction({
                from: connectedWallet,
                to: contract._address,
                data: data.encodeABI(),
            });
            console.log("Cancel Listed nft result ", result);
        } else {
            alert("Input tokenId and price field can't be blank.");
        }
    } catch(e) {
        throw e;
    }
}



