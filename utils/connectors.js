import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { WalletConnect as WalletConnectV2 } from "@web3-react/walletconnect-v2";

const metamask = initializeConnector((actions) => new MetaMask({ actions }));

 const SUPPORTED_CHAINS = {
    56: {
        urls: ["https://bsc-dataseed.binance.org"],
        name: "BSC Mainnet",
        nativeCurrency: {
          name: "Binance Coin",
          symbol: "BNB",
          decimals: 18,
        },
        blockExplorerUrls: ["https://bscscan.com"],
    },
    97: {
        urls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
        name: "Binance Smart Chain Testnet",
        nativeCurrency: {
            name: "Binance Coin",
            symbol: "tBNB",
            decimals: 18,
        },
        blockExplorerUrls: ["https://testnet.bscscan.com"],
    },

    4002: {
        urls: ["https://rpc.testnet.fantom.network"],
        name: "Fantom Testnet",
        nativeCurrency: {
            name: "Fantom",
            symbol: "ftm",
            decimals: 18,
        },
        blockExplorerUrls: ["https://testnet.ftmscan.com/"],
    },
    80001: {
        urls: ["https://rpc-mumbai.maticvigil.com"],
        name: "Mumbai",
        nativeCurrency: {
          name: "Mumbai",
          symbol: "MATIC",
          decimals: 18,
        },
        blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    },
 };

 const [mainnet, ...optionalChains] = Object.keys(SUPPORTED_CHAINS).map(Number);

 const walletConnectV2 = initializeConnector((actions) => new WalletConnectV2({
    actions,
    options: {
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        chains: [mainnet],
        optionalChains,
        showQrModal: true,
    },
 }));

 const connectors = [metamask, walletConnectV2];

 export default connectors;