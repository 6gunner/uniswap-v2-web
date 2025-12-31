import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { ChainId } from "@repo/sugar-finance-sdk";
import { networkInfoMap } from "@src/connectors";

export const RPC_PROVIDERS: {
  [key in ChainId]: StaticJsonRpcProvider;
} = {
  [ChainId.SEPOLIA]: new JsonRpcProvider(networkInfoMap[ChainId.SEPOLIA].rpcUrl),
};
