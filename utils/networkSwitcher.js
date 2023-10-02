import { networkSettings } from "./chains";

const DEFAULT_CHAINID = process.env.NEXT_PUBLIC_FANTOM_CHAINID;

export const networkSwitcher = async (
    desiredChainId = DEFAULT_CHAINID,
    reloadRequired
) => {
    const chainConfig = networkSettings[desiredChainId];

    const connectedWallet = localStorage.getItem("connectedwallet");
    if (connectedWallet === "metamask" || connectedWallet === "walletconnect") {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: chainConfig.chainId }],
            })
        } catch (error) {
            if (error.code == 4902) {
                try {
                    await window.ethereum.request({
                        methos: "wallet_addEthereumChain",
                        params: [
                            {
                                rpcUrls: chainConfig.rpcUrls,
                                chainId: chainConfig.chainId,
                                nativeCurrency: {
                                    name: chainConfig.nativeCurrency.name,
                                    symbol: chainConfig.nativeCurrency.symbol,
                                    decimals: chainConfig.nativeCurrency.decimals,
                                },
                                chainName: chainConfig.chainName,
                            },
                        ],
                    });
                } catch (addError) {
                    console.error("\n\n",addError);
                }
            }
        }
    }
};