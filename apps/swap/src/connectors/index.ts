import { ChainId } from "@repo/sugar-finance-sdk";
import { CoinbaseWallet } from "./Coinbase";
import { initializeConnector, Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";
import { MetaMask } from "./Metamask";
import { TrustWallet } from "./TrustWallet";
import { OkxWallet } from "./OkxWallet";

export const NETWORK_CHAIN_ID: ChainId = parseInt(import.meta.env.VITE_APP_CHAIN_ID) as ChainId;

const onError = (error: Error) => {
  console.error(error);
};
const [web3TrustWallet, web3TrustWalletHooks] = initializeConnector<TrustWallet>(
  (actions) =>
    new TrustWallet({
      actions,
      onError,
    })
);

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        appName: "ZKJ Swap",
        reloadOnDisconnect: false,
      },
      onError,
    })
);

const [web3MetaMask, web3MetaMaskHooks] = initializeConnector<MetaMask>(
  (actions) =>
    new MetaMask({
      actions,
      options: {
        mustBeMetaMask: true,
      },
      onError,
    })
);

export const networkInfoMap = {
  [ChainId.SEPOLIA]: {
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com/",
    scanUrl: "https://sepolia.etherscan.io",
  },
};

const [web3OkxWallet, web3OkxWalletHooks] = initializeConnector<OkxWallet>(
  (actions) =>
    new OkxWallet({
      actions,
      onError,
    })
);

export enum ConnectionType {
  METAMASK = "METAMASK",
  TRUST_WALLET = "TRUST_WALLET",
  OKX_WALLET = "OKX_WALLET",
  COINBASE_WALLET = "COINBASE_WALLET",
  NETWORK = "NETWORK",
}

export interface Connection {
  key: string;
  connector: Connector;
  hooks: Web3ReactHooks;
  type: ConnectionType;
  name: string;
  iconName: string;
  description: string;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
  installLink: string;
  rdns: string;
}

export const metamaskConnection: Connection = {
  key: ConnectionType.METAMASK,
  name: "MetaMask",
  iconName: "metamask.png",
  description: "Easy-to-use browser extension.",
  connector: web3MetaMask,
  hooks: web3MetaMaskHooks,
  type: ConnectionType.METAMASK,
  color: "#E8831D",
  rdns: "io.metamask",
  installLink: "https://metamask.io/download/",
};

export const trustWalletConnection: Connection = {
  key: ConnectionType.TRUST_WALLET,
  name: "Trust Wallet",
  connector: web3TrustWallet,
  hooks: web3TrustWalletHooks,
  type: ConnectionType.TRUST_WALLET,
  iconName: "trust.png",
  color: "#E8831D",
  description: "TrustWallet extension.",
  rdns: "com.trustwallet.app",
  installLink: "https://www.trustwallet.com/download",
};

export const coinbaseWalletConnection: Connection = {
  key: ConnectionType.COINBASE_WALLET,
  name: "Coinbase Wallet",
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
  iconName: "coinbase.png",
  color: "#315CF5",
  description: "Use Coinbase Wallet app on mobile device",
  rdns: "com.coinbase.wallet",
  installLink: "https://www.coinbase.com/wallet",
};

export const okxWalletConnection: Connection = {
  key: ConnectionType.OKX_WALLET,
  name: "OKX Wallet",
  connector: web3OkxWallet,
  hooks: web3OkxWalletHooks,
  type: ConnectionType.OKX_WALLET,
  iconName: "okx.png",
  color: "#E8831D",
  description: "OKX Wallet extension.",
  rdns: "com.okex.wallet",
  installLink: "https://www.okx.com/web3/wallet",
};

export function getConnections() {
  return [metamaskConnection, okxWalletConnection, coinbaseWalletConnection, trustWalletConnection];
}
