import React, { useState, useEffect, useRef } from "react";
import MetaMaskOnboarding from "@metamask/onboarding";
import { useWeb3React } from "@web3-react/core";
import connectors from "../../utils/connectors";

const injected = connectors[0][0];
const walletConnectV2 = connectors[1][0];

const DEFAULT_CHAINID = parseInt(process.env.NEXT_PUBLIC_FANTOM_CHAINID);

const ConnectWallet = ({ setActiveModal }) => {
    const { connector, account, chainId } = useWeb3React();
    const [activatingConnector, setActivatingConnector] = useState();
    const onboarding = useRef();

    //connect metamask function
    const onConnectToMetamaskFunc = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            setActivatingConnector(injected);
            Promise.resolve(injected.activate(DEFAULT_CHAINID)).catch((e) => {
                injected.resetState();
                setActivatingConnector();
                localStorage.removeItem("connectedWallet");
                console.debug("\nFailed to connect to metamask");
            });
            localStorage.setItem("connectedWallet", "metamask");
        } else {
            onboarding.current.startOnboarding();
        }
    };

    // coneect connectwallet function
    const onConnectWithWalletConnect = () => {
        setActivatingConnector(walletConnectV2);
        Promise.resolve(walletConnectV2.activate()).catch((e) => {
            walletConnectV2.resetState();
            setActivatingConnector();
            localStorage.removeItem("connectedWallet");
            console.debug("\nFailed to connect to WalletConnectV2");
        });
        localStorage.setItem("connectedWallet", "walletConnectV2");
    };

    useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled) {
            if (account && account.length > 0) {
                onboarding?.current?.stopOnboarding();
            }
        }
    }, [account]);

    useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);

    return (
        <div className="modal">
        <div className="modal-inner-wrapper">
        <p className="">Please select your Web3 compatible wallet</p>
        <div className="icon-wrapper">
          <img
            src="/images/metamask.png"
            onClick={() => {
              onConnectToMetamaskFunc(1);
              setActiveModal(false);
            }}
            alt="metamask"
            className=""
          />
          {/* <img
            src="/images/connect-wallet.png"
            onClick={() => {
              onConnectWithWalletConnect();
              setActiveModal(false);
            }}
            alt="connect-wallet"
            className=""
          /> */}
        </div>
        <div>
          <button
            onClick={() => setActiveModal(false)}
            className="close-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    );


  };

export default ConnectWallet;