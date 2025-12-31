import { ChainId, Pair, Token } from "@repo/sugar-finance-sdk";
import flatMap from "lodash.flatmap";
import { useCallback, useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS } from "../../constants";

import { useActiveWeb3React } from "../../hooks";
import { useAllTokens } from "../../hooks/Tokens";
import { AppDispatch, AppState } from "../index";
import {
  addSerializedPair,
  addSerializedToken,
  loadingPosition,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updatePositions,
  updateSelectedWallet,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  updateUserSnapshots,
} from "./actions";
import { ConnectionType } from "../../connectors";
import { client } from "@src/apollo/client";
import { USER_HISTORY, USER_POSITIONS } from "@src/apollo/queries";
import { useEthPrice } from "@src/context/GlobalData";
import { getLPReturnsOnPair, LiquidityPositionSnapshot } from "@src/utils/returns";

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  );
}

export function useIsDarkMode(): boolean {
  // const { userDarkMode, matchesDarkMode } = useSelector<
  //   AppState,
  //   { userDarkMode: boolean | null; matchesDarkMode: boolean }
  // >(
  //   ({ user: { matchesDarkMode, userDarkMode } }) => ({
  //     userDarkMode,
  //     matchesDarkMode,
  //   }),
  //   shallowEqual
  // );
  // return userDarkMode === null ? matchesDarkMode : userDarkMode;
  return false;
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>();
  const darkMode = useIsDarkMode();

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }));
  }, [darkMode, dispatch]);

  return [darkMode, toggleSetDarkMode];
}

export function useIsExpertMode(): boolean {
  return false;
  // return useSelector<AppState, AppState['user']['userExpertMode']>((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>();
  const expertMode = useIsExpertMode();

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }));
  }, [expertMode, dispatch]);

  return [expertMode, toggleSetExpertMode];
}

export function useUserSlippageTolerance(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>();
  const userSlippageTolerance = useSelector<AppState, AppState["user"]["userSlippageTolerance"]>(
    (state) => {
      return state.user.userSlippageTolerance;
    }
  );

  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance }));
    },
    [dispatch]
  );

  return [userSlippageTolerance, setUserSlippageTolerance];
}

export function useUserDeadline(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>();
  const userDeadline = useSelector<AppState, AppState["user"]["userDeadline"]>((state) => {
    return state.user.userDeadline;
  });

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }));
    },
    [dispatch]
  );

  return [userDeadline, setUserDeadline];
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch]
  );
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch]
  );
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveWeb3React();
  const serializedTokensMap = useSelector<AppState, AppState["user"]["tokens"]>(
    ({ user: { tokens } }) => tokens
  );

  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(serializedTokensMap[chainId as ChainId] ?? {}).map(deserializeToken);
  }, [serializedTokensMap, chainId]);
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  };
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }));
    },
    [dispatch]
  );
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(
    tokenA.chainId,
    Pair.getAddress(tokenA, tokenB),
    18,
    "SugarFinance-LP",
    "Sugar Finance"
  );
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useActiveWeb3React();
  const tokens = useAllTokens();

  // pinned pairs
  const pinnedPairs = useMemo(
    () => (chainId ? (PINNED_PAIRS[chainId as ChainId] ?? []) : []),
    [chainId]
  );

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
            const token = tokens[tokenAddress];
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId as ChainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null;
                  } else {
                    return [base, token];
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            );
          })
        : [],
    [tokens, chainId]
  );

  // pairs saved by users
  const savedSerializedPairs = useSelector<AppState, AppState["user"]["pairs"]>(
    ({ user: { pairs } }) => pairs
  );

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return [];
    const forChain = savedSerializedPairs[chainId];
    if (!forChain) return [];

    return Object.keys(forChain).map((pairId) => {
      return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)];
    });
  }, [savedSerializedPairs, chainId]);

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs]
  );

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>(
      (memo, [tokenA, tokenB]) => {
        const sorted = tokenA.sortsBefore(tokenB);
        const key = sorted
          ? `${tokenA.address}:${tokenB.address}`
          : `${tokenB.address}:${tokenA.address}`;
        if (memo[key]) return memo;
        memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA];
        return memo;
      },
      {}
    );

    return Object.keys(keyed).map((key) => keyed[key]);
  }, [combinedList]);
}

export function useSelectedWallet(): {
  selectedWallet: ConnectionType | undefined;
  updateSelectedWallet: (wallet?: ConnectionType) => void;
} {
  const selectedWallet = useSelector((state: AppState) => state.user.selectedWallet);
  const dispatch = useDispatch();
  const _updateSelectedWallet = useCallback(
    (wallet?: ConnectionType) => {
      dispatch(updateSelectedWallet({ wallet }));
    },
    [dispatch]
  );
  return { selectedWallet, updateSelectedWallet: _updateSelectedWallet };
}

/**
 * Store all the snapshots of liquidity activity for this account.
 * Each snapshot is a moment when an LP position was created or updated.
 * @param {*} account
 */
export function useUserSnapshots(account: string) {
  const dispatch = useDispatch<AppDispatch>();
  const snapshots = useSelector((state: AppState) => state.user.snapshots);

  useEffect(() => {
    async function fetchData() {
      try {
        let skip = 0;
        let allResults: LiquidityPositionSnapshot[] = [];
        let found = false;
        while (!found) {
          const result = await client.query({
            query: USER_HISTORY,
            variables: {
              skip: skip,
              user: account.toLocaleLowerCase(),
            },
            fetchPolicy: "cache-first",
          });
          allResults = allResults.concat(result.data.liquidityPositionSnapshots);
          if (result.data.liquidityPositionSnapshots.length < 1000) {
            found = true;
          } else {
            skip += 1000;
          }
        }
        if (allResults) {
          dispatch(updateUserSnapshots({ snapshots: allResults }));
        }
      } catch (e) {
        console.log(e);
      } finally {
        dispatch(loadingPosition(false));
      }
    }
    if (account) {
      dispatch(loadingPosition(true));
      fetchData();
    }
    const intervalId = setInterval(() => {
      if (account) {
        fetchData();
      }
    }, 60000); // 60 seconds interval

    return () => clearInterval(intervalId);
  }, [account]);

  return snapshots;
}

export function useUserPositions(account: string) {
  const dispatch = useDispatch<AppDispatch>();
  const positions = useSelector((state: AppState) => state.user.positions);
  const snapshots = useSelector((state: AppState) => state.user.snapshots);
  const [ethPrice] = useEthPrice();

  useEffect(() => {
    async function fetchData(account: string) {
      try {
        const result = await client.query({
          query: USER_POSITIONS,
          variables: {
            user: account,
          },
          fetchPolicy: "no-cache",
        });
        if (result?.data?.liquidityPositions) {
          const formattedPositions = await Promise.all(
            result?.data?.liquidityPositions.map(async (positionData: any) => {
              const returnData = await getLPReturnsOnPair(
                account,
                positionData.pair,
                ethPrice,
                snapshots
              );
              return {
                ...positionData,
                ...returnData,
              };
            })
          );
          dispatch(updatePositions({ positions: formattedPositions }));
        }
      } catch (e) {
        console.log(e);
      } finally {
        dispatch(loadingPosition(false));
      }
    }
    if (account) {
      dispatch(loadingPosition(true));
      fetchData(account.toLocaleLowerCase());
    }
    const intervalId = setInterval(() => {
      if (account && ethPrice && snapshots.length) {
        fetchData(account.toLocaleLowerCase());
      }
    }, 60000); // 60 seconds interval
    return () => clearInterval(intervalId);
  }, [account]);

  return positions;
}
