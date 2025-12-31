import { ChainId } from "@repo/sugar-finance-sdk";
import { NETWORK_CHAIN_ID } from "@src/connectors";
import { AddEthereumChainParameter } from "@web3-react/types";

export const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.SEPOLIA]: "Sepolia Testnet",
};
export const SUPPORTED_CHAINIDS = [NETWORK_CHAIN_ID];

export const CHAINS = {
  [ChainId.SEPOLIA]: {
    name: "Sepolia Testnet",
    chain: "Sepolia Testnet",
    rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com", "", "https://1rpc.io/sepolia"],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    } as const,
    chainId: 11155111,
    networkId: 11155111,
    blockExplorerUrls: [
      {
        name: "Sepolia Testnet",
        url: "https://sepolia.etherscan.io",
        standard: "",
      },
    ],
  },
};

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId as ChainId];
  if (chainInformation) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.rpcUrls,
      blockExplorerUrls: chainInformation.blockExplorerUrls.map((url) => url.url),
    };
  } else {
    return chainId;
  }
}
