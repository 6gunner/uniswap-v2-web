import { createAction } from "@reduxjs/toolkit";
import { ChainId, Currency, Trade } from "@repo/sugar-finance-sdk";

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}

export const addTransaction = createAction<{
  chainId: ChainId;
  hash: string;
  from: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  title?: string[];
  currency0Symbol?: string;
  currency1Symbol?: string;
}>("transactions/addTransaction");
export const clearAllTransactions = createAction<{ chainId: ChainId }>(
  "transactions/clearAllTransactions"
);
export const finalizeTransaction = createAction<{
  chainId: ChainId;
  hash: string;
  receipt: SerializableTransactionReceipt;
}>("transactions/finalizeTransaction");
export const checkedTransaction = createAction<{
  chainId: ChainId;
  hash: string;
  blockNumber: number;
}>("transactions/checkedTransaction");
