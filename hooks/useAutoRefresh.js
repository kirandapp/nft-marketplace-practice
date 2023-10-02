"use client";
import { useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import getWeb3 from "../getWeb3";
import { networkSwitcher } from "../utils/networkSwitcher";

const useAutoRefresh = () => {
  const { connector, chainId, account, provider } = useWeb3React();

  useEffect(() => {
    const connectedWallet = localStorage.getItem("connectedWallet");

    if (connectedWallet) {
      if (connector.connectEagerly) {
        connector.connectEagerly().catch((error) => {
          console.log("Failed to connect eagerly to connector", error);
        });
      } else {
        connector.activate().catch()((error) => {
          console.log("Failed to connect catch to connector", error);
        });
      }
    }
  }, []);

  useEffect(() => {
    const assignWeb3 = async () => {
      window.web3 = await getWeb3(provider, chainId);
    };
    if (account && provider) {
      assignWeb3();
    }
  }, [account, provider]);

  useEffect(() => {
    if (
      ((chainId === 80001) &&
        account) ||
      typeof chainId === "undefined"
    ) {
      // do nothing
    } else {
      alert("App only support Polygon test network");
      networkSwitcher();
    }
  }, [chainId]);
};

export default useAutoRefresh;