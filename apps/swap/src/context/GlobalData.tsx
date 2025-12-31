import { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from "react";
import { client } from "../apollo/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  getPercentChange,
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  get2DayPercentChange,
} from "../utils/swapInfo";
import {
  GLOBAL_DATA,
  GLOBAL_TXNS,
  GLOBAL_CHART,
  ETH_PRICE,
  ALL_PAIRS,
  ALL_TOKENS,
  TOP_LPS_PER_PAIRS,
} from "../apollo/queries";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useAllPairData } from "./PairData";
const UPDATE = "UPDATE";
const UPDATE_TXNS = "UPDATE_TXNS";
const UPDATE_CHART = "UPDATE_CHART";
const UPDATE_ETH_PRICE = "UPDATE_ETH_PRICE";
const ETH_PRICE_KEY = "ETH_PRICE_KEY";
const UPDATE_ALL_PAIRS_IN_SUGAR_FINANCE = "UPDAUPDATE_ALL_PAIRS_IN_SUGAR_FINANCETE_TOP_PAIRS";
const UPDATE_ALL_TOKENS_IN_SUGAR_FINANCE = "UPDATE_ALL_TOKENS_IN_SUGAR_FINANCE";
const UPDATE_TOP_LPS = "UPDATE_TOP_LPS";
// 记得每次重新部署uniswap的the graph后，更新这个值
export const MIN_BLOCK = 6940000;

// format dayjs with the libraries that we need
dayjs.extend(utc);
dayjs.extend(weekOfYear);

interface GlobalDataState {
  globalData?: any; // Replace 'any' with a more specific type if known
  transactions?: any; // Replace 'any' with a more specific type if known

  [ETH_PRICE_KEY]?: number;
  oneDayPrice?: number;
  ethPriceChange?: number;
  allPairs?: any[]; // Replace 'any' with a more specific type if known
  allTokens?: any[]; // Replace 'any' with a more specific type if known
  topLps?: any[]; // Replace 'any' with a more specific type if known
}

interface GlobalDataActions {
  update: (data: any) => void; // Replace 'any' with a more specific type if known
  updateTransactions: (transactions: any) => void; // Replace 'any' with a more specific type if known
  updateChart: (daily: any, weekly: any) => void; // Replace 'any' with a more specific type if known
  updateEthPrice: (ethPrice: number, oneDayPrice: number, ethPriceChange: number) => void;
  updateAllPairsInSugarFinance: (allPairs: any[]) => void; // Replace 'any' with a more specific type if known
  updateAllTokensInSugarFinance: (allTokens: any[]) => void; // Replace 'any' with a more specific type if known
  updateTopLps: (topLps: any[]) => void; // Replace 'any' with a more specific type if known
}

type GlobalDataContextType = [GlobalDataState, GlobalDataActions];

const GlobalDataContext = createContext<GlobalDataContextType>([
  {},
  {
    update: function (data: any): void {
      throw new Error("Function not implemented.");
    },
    updateTransactions: function (transactions: any): void {
      throw new Error("Function not implemented.");
    },
    updateChart: function (daily: any, weekly: any): void {
      throw new Error("Function not implemented.");
    },
    updateEthPrice: function (ethPrice: number, oneDayPrice: number, ethPriceChange: number): void {
      throw new Error("Function not implemented.");
    },
    updateAllPairsInSugarFinance: function (allPairs: any[]): void {
      throw new Error("Function not implemented.");
    },
    updateAllTokensInSugarFinance: function (allTokens: any[]): void {
      throw new Error("Function not implemented.");
    },
    updateTopLps: function (topLps: any[]): void {
      throw new Error("Function not implemented.");
    },
  },
]);

function useGlobalDataContext() {
  return useContext(GlobalDataContext);
}

function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case UPDATE: {
      const { data } = payload;
      return {
        ...state,
        globalData: data,
      };
    }
    case UPDATE_TXNS: {
      const { transactions } = payload;
      return {
        ...state,
        transactions,
      };
    }

    case UPDATE_ETH_PRICE: {
      const { ethPrice, oneDayPrice, ethPriceChange } = payload;
      return {
        [ETH_PRICE_KEY]: ethPrice,
        oneDayPrice,
        ethPriceChange,
      };
    }

    case UPDATE_ALL_PAIRS_IN_SUGAR_FINANCE: {
      const { allPairs } = payload;
      return {
        ...state,
        allPairs,
      };
    }

    case UPDATE_ALL_TOKENS_IN_SUGAR_FINANCE: {
      const { allTokens } = payload;
      return {
        ...state,
        allTokens,
      };
    }

    case UPDATE_TOP_LPS: {
      const { topLps } = payload;
      return {
        ...state,
        topLps,
      };
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {});
  const update = useCallback((data) => {
    dispatch({
      type: UPDATE,
      payload: {
        data,
      },
    });
  }, []);

  const updateTransactions = useCallback((transactions) => {
    dispatch({
      type: UPDATE_TXNS,
      payload: {
        transactions,
      },
    });
  }, []);

  const updateEthPrice = useCallback((ethPrice, oneDayPrice, ethPriceChange) => {
    dispatch({
      type: UPDATE_ETH_PRICE,
      payload: {
        ethPrice,
        oneDayPrice,
        ethPriceChange,
      },
    });
  }, []);

  const updateAllPairsInSugarFinance = useCallback((allPairs) => {
    dispatch({
      type: UPDATE_ALL_PAIRS_IN_SUGAR_FINANCE,
      payload: {
        allPairs,
      },
    });
  }, []);

  const updateAllTokensInSugarFinance = useCallback((allTokens) => {
    dispatch({
      type: UPDATE_ALL_TOKENS_IN_SUGAR_FINANCE,
      payload: {
        allTokens,
      },
    });
  }, []);

  const updateTopLps = useCallback((topLps) => {
    dispatch({
      type: UPDATE_TOP_LPS,
      payload: {
        topLps,
      },
    });
  }, []);
  return (
    <GlobalDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateTransactions,
            updateEthPrice,
            updateTopLps,
            updateAllPairsInSugarFinance,
            updateAllTokensInSugarFinance,
          },
        ],
        [
          state,
          update,
          updateTransactions,
          updateTopLps,
          updateEthPrice,
          updateAllPairsInSugarFinance,
          updateAllTokensInSugarFinance,
        ]
      )}
    >
      {children}
    </GlobalDataContext.Provider>
  );
}

/**
 * Gets all the global data for the overview page.
 * Needs current eth price and the old eth price to get
 * 24 hour USD changes.
 * @param {*} ethPrice
 * @param {*} oldEthPrice
 */

async function getGlobalData(ethPrice: number | undefined, oldEthPrice: number | undefined) {
  // data for each day , historic data used for % changes
  let data = {};
  let oneDayData = {};
  let twoDayData = {};

  try {
    // get timestamps for the days
    const utcCurrentTime = dayjs();
    const utcOneDayBack = utcCurrentTime.subtract(1, "day").unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, "day").unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, "week").unix();
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, "week").unix();

    // get the blocks needed for time travel queries
    const [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack,
    ]);

    // fetch the global data
    const result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: "cache-first",
    });
    data = result.data.pandraFactories[0];

    // fetch the historical data
    const oneDayResult = await client.query({
      query: GLOBAL_DATA(oneDayBlock?.number),
      fetchPolicy: "cache-first",
    });
    oneDayData = oneDayResult.data.pandraFactories[0];

    const twoDayResult = await client.query({
      query: GLOBAL_DATA(twoDayBlock?.number),
      fetchPolicy: "cache-first",
    });
    twoDayData = twoDayResult.data.pandraFactories[0];

    const oneWeekResult = await client.query({
      query: GLOBAL_DATA(oneWeekBlock?.number),
      fetchPolicy: "cache-first",
    });
    const oneWeekData = oneWeekResult.data.pandraFactories[0];

    const twoWeekResult = await client.query({
      query: GLOBAL_DATA(twoWeekBlock?.number),
      fetchPolicy: "cache-first",
    });
    const twoWeekData = twoWeekResult.data.pandraFactories[0];

    if (data && oneDayData && twoDayData && twoWeekData) {
      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneDayData.totalVolumeUSD,
        twoDayData.totalVolumeUSD
      );

      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneWeekData.totalVolumeUSD,
        twoWeekData.totalVolumeUSD
      );

      const [oneDayTxns, txnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData.txCount ? twoDayData.txCount : 0
      );

      // format the total liquidity in USD
      data.totalLiquidityUSD = data.totalLiquidityETH * ethPrice;
      const liquidityChangeUSD = getPercentChange(
        data.totalLiquidityETH * ethPrice,
        oneDayData.totalLiquidityETH * oldEthPrice
      );

      // add relevant fields with the calculated amounts
      data.oneDayVolumeUSD = oneDayVolumeUSD;
      data.oneWeekVolume = oneWeekVolume;
      data.weeklyVolumeChange = weeklyVolumeChange;
      data.volumeChangeUSD = volumeChangeUSD;
      data.liquidityChangeUSD = liquidityChangeUSD;
      data.oneDayTxns = oneDayTxns;
      data.txnChange = txnChange;
    }
  } catch (e) {
    console.log(e);
  }

  return data;
}

/**
 * Get and format transactions for global page
 */
const getGlobalTransactions = async () => {
  const transactions = {};

  try {
    const result = await client.query({
      query: GLOBAL_TXNS,
      fetchPolicy: "cache-first",
    });
    transactions.mints = [];
    transactions.burns = [];
    transactions.swaps = [];
    result?.data?.transactions &&
      result.data.transactions.map((transaction) => {
        if (transaction.mints.length > 0) {
          transaction.mints.map((mint) => {
            return transactions.mints.push(mint);
          });
        }
        if (transaction.burns.length > 0) {
          transaction.burns.map((burn) => {
            return transactions.burns.push(burn);
          });
        }
        if (transaction.swaps.length > 0) {
          transaction.swaps.map((swap) => {
            return transactions.swaps.push(swap);
          });
        }
        return true;
      });
  } catch (e) {
    console.log(e);
  }

  return transactions;
};

/**
 * Gets the current price  of ETH, 24 hour price, and % change between them
 */
const getEthPrice = async () => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, "day").startOf("minute").unix();

  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  try {
    let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
    // 部署the graph的最新的block是29317
    if (oneDayBlock < MIN_BLOCK) {
      oneDayBlock = MIN_BLOCK;
    }
    const result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: "cache-first",
    });
    const resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: "cache-first",
    });
    const currentPrice = result?.data?.bundles[0]?.ethPrice;
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice;
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
    ethPrice = currentPrice;
    ethPriceOneDay = oneDayBackPrice;
  } catch (e) {
    console.log(e);
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
};

const PAIRS_TO_FETCH = 500;
const TOKENS_TO_FETCH = 500;

/**
 * Loop through every pair on sugar-finance, used for search
 */
async function getAllPairsOnSugarFinance() {
  try {
    let allFound = false;
    let pairs = [];
    let skipCount = 0;
    while (!allFound) {
      const result = await client.query({
        query: ALL_PAIRS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: "cache-first",
      });
      skipCount = skipCount + PAIRS_TO_FETCH;
      pairs = pairs.concat(result?.data?.pairs);
      if (result?.data?.pairs.length < PAIRS_TO_FETCH || pairs.length > PAIRS_TO_FETCH) {
        allFound = true;
      }
    }
    return pairs;
  } catch (e) {
    console.log(e);
  }
}

/**
 * Loop through every token on sugar-finance, used for search
 */
async function getAllTokensOnSugarFinance() {
  try {
    let allFound = false;
    let skipCount = 0;
    let tokens = [];
    while (!allFound) {
      const result = await client.query({
        query: ALL_TOKENS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: "cache-first",
      });
      tokens = tokens.concat(result?.data?.tokens);
      if (result?.data?.tokens?.length < TOKENS_TO_FETCH || tokens.length > TOKENS_TO_FETCH) {
        allFound = true;
      }
      skipCount = skipCount += TOKENS_TO_FETCH;
    }
    return tokens;
  } catch (e) {
    console.log(e);
  }
}

export function useEthPrice() {
  const [state, { updateEthPrice }] = useGlobalDataContext();
  const ethPrice = state?.[ETH_PRICE_KEY];
  const ethPriceOld = state?.["oneDayPrice"];
  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        const [newPrice, oneDayPrice, priceChange] = await getEthPrice();
        updateEthPrice(newPrice, oneDayPrice, priceChange);
      }
    }
    checkForEthPrice();
  }, [ethPrice, updateEthPrice]);

  return [ethPrice, ethPriceOld];
}

/**
 * Hook that fetches overview data, plus all tokens and pairs for search
 */
export function useGlobalData() {
  const [state, { update, updateAllPairsInSugarFinance, updateAllTokensInSugarFinance }] =
    useGlobalDataContext();
  const [ethPrice, oldEthPrice] = useEthPrice();

  const data = state?.globalData;

  // const combinedVolume = useTokenDataCombined(offsetVolumes)

  useEffect(() => {
    async function fetchData() {
      const globalData = await getGlobalData(ethPrice, oldEthPrice);

      globalData && update(globalData);

      const allPairs = await getAllPairsOnSugarFinance();
      updateAllPairsInSugarFinance(allPairs);

      const allTokens = await getAllTokensOnSugarFinance();
      updateAllTokensInSugarFinance(allTokens);
    }
    if (!data && ethPrice && oldEthPrice) {
      fetchData();
    }
  }, [
    ethPrice,
    oldEthPrice,
    update,
    data,
    updateAllPairsInSugarFinance,
    updateAllTokensInSugarFinance,
  ]);

  return data || {};
}

export function useGlobalTransactions() {
  const [state, { updateTransactions }] = useGlobalDataContext();
  const transactions = state?.transactions;
  useEffect(() => {
    async function fetchData() {
      if (!transactions) {
        const txns = await getGlobalTransactions();
        updateTransactions(txns);
      }
    }
    fetchData();
  }, [updateTransactions, transactions]);
  return transactions;
}

export function useAllPairsInSugarFinance() {
  const [state] = useGlobalDataContext();
  const allPairs = state?.allPairs;

  return allPairs || [];
}

export function useAllTokensInSugarFinance() {
  const [state] = useGlobalDataContext();
  const allTokens = state?.allTokens;

  return allTokens || [];
}

/**
 * Get the top liquidity positions based on USD size
 * @TODO Not a perfect lookup needs improvement
 */
export function useTopLps() {
  const [state, { updateTopLps }] = useGlobalDataContext();
  const topLps = state?.topLps;

  const allPairs = useAllPairData();

  useEffect(() => {
    async function fetchData() {
      // get top 20 by reserves
      const topPairs = Object.keys(allPairs)
        ?.sort((a, b) => parseFloat(allPairs[a].reserveUSD > allPairs[b].reserveUSD ? -1 : 1))
        ?.slice(0, 99)
        .map((pair) => pair);

      const topLpLists = await Promise.all(
        topPairs.map(async (pair) => {
          // for each one, fetch top LPs
          try {
            const { data: results } = await client.query({
              query: TOP_LPS_PER_PAIRS,
              variables: {
                pair: pair.toString(),
              },
              fetchPolicy: "cache-first",
            });
            if (results) {
              return results.liquidityPositions;
            }
          } catch (e) {}
        })
      );

      // get the top lps from the results formatted
      const topLps = [];
      topLpLists
        .filter((i) => !!i) // check for ones not fetched correctly
        .map((list) => {
          return list.map((entry) => {
            const pairData = allPairs[entry.pair.id];
            return topLps.push({
              user: entry.user,
              pairName: pairData.token0.symbol + "-" + pairData.token1.symbol,
              pairAddress: entry.pair.id,
              token0: pairData.token0.id,
              token1: pairData.token1.id,
              usd:
                (parseFloat(entry.liquidityTokenBalance) / parseFloat(pairData.totalSupply)) *
                parseFloat(pairData.reserveUSD),
            });
          });
        });

      const sorted = topLps.sort((a, b) => (a.usd > b.usd ? -1 : 1));
      const shorter = sorted.splice(0, 100);
      updateTopLps(shorter);
    }

    if (!topLps && allPairs && Object.keys(allPairs).length > 0) {
      fetchData();
    }
  });

  return topLps;
}
