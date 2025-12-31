import { getAddChainParameters } from "@src/utils/chain";
import { useWeb3React } from "@web3-react/core";
import { useCallback } from "react";

export const useSwitchChain = () => {
  const { connector, chainId } = useWeb3React();
  return useCallback(
    async (desiredChainId: number) => {
      try {
        await connector.activate(getAddChainParameters(desiredChainId));
      } catch (error) {
        console.error(error);
      }
    },
    [connector, chainId]
  );
};
