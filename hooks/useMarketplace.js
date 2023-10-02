import useContract from "./useContract";

import abi from "../contracts/marketplaceABI.json";

const useMarketplace = () => {
  return useContract(
    process.env.NEXT_PUBLIC_FANTOMTESTNET_MARKETPLACE,
    abi,
    process.env.NEXT_PUBLIC_FANTOM_CHAINID
  );
};

export default useMarketplace;
