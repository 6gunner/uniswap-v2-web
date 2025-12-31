import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from "react";

import { client } from "../apollo/client";
import {
  PAIR_DATA,
  PAIRS_CURRENT,
  PAIRS_BULK,
  PAIRS_HISTORICAL_BULK,
  HOURLY_PAIR_RATES,
} from "../apollo/queries";

import { useEthPrice } from "./GlobalData";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  getPercentChange,
  get2DayPercentChange,
  getBlocksFromTimestamps,
  getTimestampsForChanges,
  splitQuery,
} from "../utils/swapInfo";
import { isAddress } from "../utils";
import { TRACKED_OVERRIDES_PAIRS, TRACKED_OVERRIDES_TOKENS } from "../constants";
import { MIN_BLOCK } from "./GlobalData";
const UPDATE = "UPDATE";
const UPDATE_TOP_PAIRS = "UPDATE_TOP_PAIRS";
const UPDATE_HOURLY_DATA = "UPDATE_HOURLY_DATA";

// Define the provider props type
interface ProviderProps {
  children: React.ReactNode;
}

// Define the pair data type
interface PairData {
  id: string;
  volumeUSD: number;
  untrackedVolumeUSD: number;
  trackedReserveETH: number;
  reserveUSD: number;
  createdAtBlockNumber: number;
  oneDayVolumeUSD?: number;
  oneWeekVolumeUSD?: number;
  volumeChangeUSD?: number;
  oneDayVolumeUntracked?: number;
  oneWeekVolumeUntracked?: number;
  volumeChangeUntracked?: number;
  trackedReserveUSD?: number;
  liquidityChangeUSD?: number;
  token0: { id: string };
  token1: { id: string };
  // Add other fields as necessary
}

// Define the transaction type
interface Transactions {
  mints: any[];
  burns: any[];
  swaps: any[];
}

// Define the hourly rate data type
interface HourlyRateData {
  timestamp: string;
  rate0: number;
  rate1: number;
}

// Define types for actions
type ActionType =
  | { type: "UPDATE"; payload: { pairAddress: string; data: any } }
  | { type: "UPDATE_TOP_PAIRS"; payload: { topPairs: any[] } }
  | {
      type: "UPDATE_HOURLY_DATA";
      payload: { address: string; hourlyData: any; timeWindow: string };
    };

// Define the state type
type StateType = Record<string, any>;

// Define the context type
type PairDataContextType = [
  StateType,
  {
    update: (pairAddress: string, data: any) => void;
    updateTopPairs: (topPairs: any[]) => void;
    updateHourlyData: (address: string, hourlyData: any, timeWindow: string) => void;
  },
];

dayjs.extend(utc);

const PairDataContext = createContext<PairDataContextType>([
  {},
  {
    update: (pairAddress: string, data: any) => {},
    updateTopPairs: (topPairs: any[]) => {},
    updateHourlyData: (address: string, hourlyData: any, timeWindow: string) => {},
  },
]);

function usePairDataContext() {
  return useContext(PairDataContext);
}

function reducer(state: StateType, { type, payload }: ActionType) {
  switch (type) {
    case UPDATE: {
      const { pairAddress, data } = payload;
      return {
        ...state,
        [pairAddress]: {
          ...state?.[pairAddress],
          ...data,
        },
      };
    }

    case UPDATE_TOP_PAIRS: {
      const { topPairs } = payload;
      const added: Record<string, PairData> = {};
      topPairs.map((pair: PairData) => {
        return (added[pair.id] = pair);
      });
      return {
        ...state,
        ...added,
      };
    }

    case UPDATE_HOURLY_DATA: {
      const { address, hourlyData, timeWindow } = payload;
      return {
        ...state,
        [address]: {
          ...state?.[address],
          hourlyData: {
            ...state?.[address]?.hourlyData,
            [timeWindow]: hourlyData,
          },
        },
      };
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {});

  // update pair specific data
  const update = useCallback((pairAddress: string, data: any) => {
    // debugger;
    dispatch({
      type: UPDATE,
      payload: {
        pairAddress,
        data,
      },
    });
  }, []);

  const updateTopPairs = useCallback((topPairs: PairData[]) => {
    // debugger;
    dispatch({
      type: UPDATE_TOP_PAIRS,
      payload: {
        topPairs,
      },
    });
  }, []);

  const updateHourlyData = useCallback((address, hourlyData, timeWindow) => {
    // debugger;
    dispatch({
      type: UPDATE_HOURLY_DATA,
      payload: { address, hourlyData, timeWindow },
    });
  }, []);

  return (
    <PairDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateTopPairs,
            updateHourlyData,
          },
        ],
        [state, update, updateTopPairs, updateHourlyData]
      )}
    >
      {children}
    </PairDataContext.Provider>
  );
}

// 根据eth价格倒序查pair list
async function getBulkPairData(
  pairList: string[],
  ethPrice: number
): Promise<PairData[] | undefined> {
  const [t1, t2, tWeek] = getTimestampsForChanges();
  const blocks = await getBlocksFromTimestamps([t1, t2, tWeek]);

  const b1 = Math.max(blocks[0]?.number ?? MIN_BLOCK, MIN_BLOCK);
  const b2 = Math.max(blocks[1]?.number ?? MIN_BLOCK, MIN_BLOCK);
  const bWeek = Math.max(blocks[2]?.number ?? MIN_BLOCK, MIN_BLOCK);

  try {
    const current = await client.query({
      query: PAIRS_BULK,
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: "cache-first",
    });

    const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek]
        .filter((item) => item && true)
        .map(async (block) => {
          const result = client.query({
            query: PAIRS_HISTORICAL_BULK(block, pairList),
            fetchPolicy: "cache-first",
          });
          return result;
        })
    );

    const oneDayData = oneDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    const twoDayData = twoDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    const oneWeekData = oneWeekResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async (pair) => {
          let data = pair;
          let oneDayHistory = oneDayData?.[pair.id];
          if (!oneDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, b1),
              fetchPolicy: "cache-first",
            });
            oneDayHistory = newData.data.pairs[0];
          }
          let twoDayHistory = twoDayData?.[pair.id];
          if (!twoDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, b2),
              fetchPolicy: "cache-first",
            });
            twoDayHistory = newData.data.pairs[0];
          }
          let oneWeekHistory = oneWeekData?.[pair.id];
          if (!oneWeekHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, bWeek),
              fetchPolicy: "cache-first",
            });
            oneWeekHistory = newData.data.pairs[0];
          }
          data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, ethPrice, b1);
          return data;
        })
    );
    return pairData;
  } catch (e) {
    console.log(e);
  }
}

function parseData(data, oneDayData, twoDayData, oneWeekData, ethPrice, oneDayBlock) {
  const pairAddress = data.id;

  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  );
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? parseFloat(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  );

  const oneWeekVolumeUSD = parseFloat(
    oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD
  );

  const oneWeekVolumeUntracked = parseFloat(
    oneWeekData
      ? data?.untrackedVolumeUSD - oneWeekData?.untrackedVolumeUSD
      : data.untrackedVolumeUSD
  );

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD);
  data.oneWeekVolumeUSD = oneWeekVolumeUSD;
  data.volumeChangeUSD = volumeChangeUSD;
  data.oneDayVolumeUntracked = oneDayVolumeUntracked;
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked;
  data.volumeChangeUntracked = volumeChangeUntracked;

  // set liquidity properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice;
  data.liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD);

  // format if pair hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = parseFloat(data.volumeUSD);
  }

  if (
    TRACKED_OVERRIDES_PAIRS.includes(pairAddress) ||
    TRACKED_OVERRIDES_TOKENS.includes(data.token0.id) ||
    TRACKED_OVERRIDES_TOKENS.includes(data.token1.id)
  ) {
    data.oneDayVolumeUSD = oneDayVolumeUntracked;
    data.oneWeekVolumeUSD = oneWeekVolumeUntracked;
    data.volumeChangeUSD = volumeChangeUntracked;
    data.trackedReserveUSD = data.reserveUSD;
  }

  // format incorrect names

  return data;
}

const getHourlyRateData = async (pairAddress, startTime, latestBlock) => {
  try {
    const utcEndTime = dayjs.utc();
    let time = startTime;

    // create an array of hour start times until we reach current hour
    const timestamps = [];
    while (time <= utcEndTime.unix() - 3600) {
      timestamps.push(time);
      time += 3600;
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return [];
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks;

    blocks = await getBlocksFromTimestamps(timestamps, 100);

    // catch failing case
    if (!blocks || blocks?.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return parseFloat(b.number) <= parseFloat(latestBlock);
      });
    }

    const result = await splitQuery(HOURLY_PAIR_RATES, client, [pairAddress], blocks, 100);

    // format token ETH price results
    const values = [];
    for (const row in result) {
      const timestamp = row.split("t")[1];
      if (timestamp) {
        values.push({
          timestamp,
          rate0: parseFloat(result[row]?.token0Price),
          rate1: parseFloat(result[row]?.token1Price),
        });
      }
    }

    const formattedHistoryRate0 = [];
    const formattedHistoryRate1 = [];

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistoryRate0.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].rate0),
        close: parseFloat(values[i + 1].rate0),
      });
      formattedHistoryRate1.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].rate1),
        close: parseFloat(values[i + 1].rate1),
      });
    }

    return [formattedHistoryRate0, formattedHistoryRate1];
  } catch (e) {
    console.log(e);
    return [[], []];
  }
};

export function Updater() {
  const [, { updateTopPairs }] = usePairDataContext();
  const [ethPrice] = useEthPrice();

  useEffect(() => {
    console.log("get top pairs by reserves Updater");
    async function getData() {
      try {
        const {
          data: { pairs },
        } = await client.query({
          query: PAIRS_CURRENT,
          fetchPolicy: "cache-first",
        });

        const formattedPairs = pairs.map((pair) => pair.id);
        const topPairs = await getBulkPairData(formattedPairs, ethPrice);
        if (topPairs) {
          updateTopPairs(topPairs);
        }
      } catch (error) {
        console.error("Failed to fetch pair data:", error);
      }
    }

    if (ethPrice) {
      getData();
      const intervalId = setInterval(getData, 60000);
      return () => clearInterval(intervalId);
    }
  }, [ethPrice, updateTopPairs]);

  return null;
}

/**
 * @todo
 * store these updates to reduce future redundant calls
 */
export function useDataForList(pairList) {
  const [state] = usePairDataContext();
  const [ethPrice] = useEthPrice();

  const [stale, setStale] = useState(false);
  const [fetched, setFetched] = useState([]);

  // reset
  useEffect(() => {
    if (pairList) {
      setStale(false);
      setFetched();
    }
  }, [pairList]);

  useEffect(() => {
    async function fetchNewPairData() {
      const newFetched = [];
      const unfetched = [];

      pairList.map(async (pair) => {
        const currentData = state?.[pair.id];
        if (!currentData) {
          unfetched.push(pair.id);
        } else {
          newFetched.push(currentData);
        }
      });

      const newPairData = await getBulkPairData(
        unfetched.map((pair) => {
          return pair;
        }),
        ethPrice
      );
      setFetched(newFetched.concat(newPairData));
    }
    if (ethPrice && pairList && pairList.length > 0 && !fetched && !stale) {
      setStale(true);
      fetchNewPairData();
    }
  }, [ethPrice, state, pairList, stale, fetched]);

  const formattedFetch =
    fetched &&
    fetched.reduce((obj, cur) => {
      return { ...obj, [cur?.id]: cur };
    }, {});

  return formattedFetch;
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress: string) {
  const [state, { update }] = usePairDataContext();
  const [ethPrice] = useEthPrice();
  const pairData = state?.[pairAddress];

  useEffect(() => {
    async function fetchData() {
      if (!pairData && pairAddress) {
        const data = await getBulkPairData([pairAddress], ethPrice);
        data && update(pairAddress, data[0]);
      }
    }
    if (!pairData && pairAddress && ethPrice && isAddress(pairAddress)) {
      fetchData();
    }
  }, [pairAddress, pairData, update, ethPrice]);

  return pairData || {};
}

/**
 * Get list of all pairs in Sugar Finance
 */
export function useAllPairData() {
  const [state] = usePairDataContext();
  return state || {};
}
