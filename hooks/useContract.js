import { useMemo } from "react";
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";

const useContract = (
  address,
  ABI,
  contractChainId
) => {

  const { connector, isActive, account, chainId } = useWeb3React();

  let _web3;

  if (typeof window !== "undefined") {
    if (connector && isActive && account && (chainId === contractChainId) ) {
      _web3 = window.web3;
    } else {
        _web3 = new Web3(
          new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_FTM_RPC)
        );
    }
    return useMemo(() => {
      if (!address || !ABI || !_web3) return null;
      try {
        // console.log("creating instance");
        const contractInstance = new _web3.eth.Contract(ABI, address);
        // console.log("\n\nCONTRACT INSTANCE ----------- ",contractInstance);
        return contractInstance;
      } catch (error) {
        console.error("Failed to get contract", error);
        return null;
      }
    }, [connector, address, chainId, account]);
  }
};

export default useContract;