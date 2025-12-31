import { Contract } from "@ethersproject/contracts";
import { ChainId, WETH } from "@repo/sugar-finance-sdk";
import { abi as ISugarFinanceV2PairABI } from "@src/constants/v2/ISugarFinancePair.json";
import { useMemo } from "react";
import ENS_ABI from "../constants/abis/ens-registrar.json";
import ENS_PUBLIC_RESOLVER_ABI from "../constants/abis/ens-public-resolver.json";
import { ERC20_BYTES32_ABI } from "../constants/abis/erc20";
import ERC20_ABI from "../constants/abis/erc20.json";
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from "../constants/abis/migrator";
import UNISOCKS_ABI from "../constants/abis/unisocks.json";
import WETH_ABI from "../constants/abis/weth.json";
import { MULTICALL_ABI, MULTICALL_NETWORKS } from "../constants/multicall";
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from "../constants/v1";
import { getContract } from "../utils";
import { useActiveWeb3React } from "./index";
import { RPC_PROVIDERS } from "@src/constants/providers";

// returns null on errors
function useContract(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true
): Contract | null {
  const { library: walletLibrary, account, currentChainId, chainId } = useActiveWeb3React();
  const libraryFromChain = RPC_PROVIDERS[chainId as ChainId];
  const library = walletLibrary ?? libraryFromChain;
  return useMemo(() => {
    if (!address || !ABI || !library || !currentChainId) return null;
    try {
      if (currentChainId !== chainId) {
        return getContract(address, ABI, libraryFromChain, undefined);
      }
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false);
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true);
}

export function useV1ExchangeContract(
  address?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible);
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId ? WETH[chainId as ChainId].address : undefined,
    WETH_ABI,
    withSignerIfPossible
  );
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React();
  let address: string | undefined;
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
        address = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
        break;
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible);
}

export function useENSResolverContract(
  address: string | undefined,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible);
}

export function useBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function usePairContract(
  pairAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(pairAddress, ISugarFinanceV2PairABI, withSignerIfPossible);
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false);
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId === ChainId.MAINNET ? "0x65770b5283117639760beA3F867b69b3697a91dd" : undefined,
    UNISOCKS_ABI,
    false
  );
}
