import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import { Connector } from "@web3-react/types";
import {
  ConnectionType,
  getConnections,
  metamaskConnection,
  coinbaseWalletConnection,
  okxWalletConnection,
  trustWalletConnection,
  NETWORK_CHAIN_ID,
} from "../connectors";
import { useSelectedWallet } from "../state/user/hooks";

import { SUPPORTED_CHAINIDS } from "@src/utils/chain";
import { useSelector } from "react-redux";
import { AppState } from "@src/state";

export function useActiveWeb3React() {
  const context = useWeb3React();
  return {
    ...context,
    chainId: NETWORK_CHAIN_ID,
    currentChainId: context.chainId,
    library: context.provider,
  };
}

// 如果用户已连接钱包且链ID正确，使用用户的 Web3 连接
// if (context.isActive && chainId === targetChainId) {
//   return {
//     ...context,
//     currentChainId: chainId,
//     library: context.provider,
//   };
// }

// // 否则使用默认的网络连接
// const networkProvider = new JsonRpcProvider(networkInfoMap[targetChainId].rpcUrl);
// debugger
// return {
//   ...context,
//   account: undefined,
//   chainId: targetChainId,
//   currentChainId: chainId,
//   library: new Web3Provider(networkProvider),
//   isActive: false,
// };

export function useGetConnection() {
  return useCallback((c: Connector | ConnectionType) => {
    if (c instanceof Connector) {
      const connection = getConnections().find((connection) => connection.connector === c);
      if (!connection) {
        throw Error("unsupported connector");
      }
      return connection;
    } else {
      switch (c) {
        case ConnectionType.METAMASK:
          return metamaskConnection;
        case ConnectionType.COINBASE_WALLET:
          return coinbaseWalletConnection;
        // case ConnectionType.WALLET_CONNECT:
        //   return walletConnectConnection;
        case ConnectionType.TRUST_WALLET:
          return trustWalletConnection;
        case ConnectionType.OKX_WALLET:
          return okxWalletConnection;
        default:
          throw Error("unsupported connector");
      }
    }
  }, []);
}

async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
}

export default function useEagerlyConnect() {
  const isLogout = useSelector((state: AppState) => state.user.isLogout);
  const { selectedWallet, updateSelectedWallet } = useSelectedWallet();
  const getConnection = useGetConnection();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    // debugger;
    if (!isLogout) {
      if (selectedWallet) {
        try {
          const selectedConnection = getConnection(selectedWallet);
          connect(selectedConnection.connector).then(() => setTried(true));
        } catch {
          updateSelectedWallet(undefined);
        }
      }
      setTried(true);
    } else {
      setTried(true);
    }
  }, [isLogout]);
  return tried;
}

export function useIsSupportedNetwork() {
  const { currentChainId, chainId } = useActiveWeb3React();
  if (currentChainId) return !!SUPPORTED_CHAINIDS.includes(currentChainId);
  if (!chainId) return true;
  return !!SUPPORTED_CHAINIDS.includes(chainId);
}
