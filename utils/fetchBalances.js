import { useWeb3React } from "@web3-react/core";
import useContract from "../hooks/useContract";
import Web3 from "web3";

export const fetchBalances = async(account) => {
    try {
        let _web3 = new Web3(window.ethereum);
        // const contract = new _web3.eth.Contract(tokenABI, tokenAddress);
        // console.log("web",_web3);
        const balanceInWei = await _web3.eth.getBalance(account);
        const balance = _web3.utils.fromWei(balanceInWei, 'ether');
        const formattedBnbBalance = parseFloat(balance).toFixed(4); // Format with 4 digits after decimal
        // console.log("formattedBnbBalance ", formattedBnbBalance);

        return formattedBnbBalance;
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}

