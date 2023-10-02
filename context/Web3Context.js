'use client'
import { Web3Provider } from "@ethersproject/providers";
import {
    Web3ReactProvider,
    Web3ReactHooks,
    useWeb3React,
} from "@web3-react/core";

import allConnections from "../utils/connectors";

import { getName } from "../utils/getConnectorName";

function Child() {
    const { connector, account, chainId, provider } = useWeb3React();
    console.log(`\nPriority Connector is : ${getName(connector)}`);
    console.log(`\nConnected Account is : ${account}`);
    console.log(`\nActiveChainId is : ${chainId}`);
    return null;
}

const connections = allConnections.map(([connector, hooks]) => [connector, hooks,]);

export default function Web3Context({ children }) {
    return (
        <Web3ReactProvider connectors={connections}>
        <Child />
        {children}
        </Web3ReactProvider>
    );
};