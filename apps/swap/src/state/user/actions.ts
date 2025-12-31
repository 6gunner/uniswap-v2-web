import { createAction } from "@reduxjs/toolkit";
import { ConnectionType } from "../../connectors";
import { LiquidityPositionSnapshot } from "@src/utils/returns";

export interface SerializedToken {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface SerializedPair {
  token0: SerializedToken;
  token1: SerializedToken;
}

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>(
  "user/updateMatchesDarkMode"
);
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>(
  "user/updateUserDarkMode"
);
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>(
  "user/updateUserExpertMode"
);
export const updateUserSlippageTolerance = createAction<{
  userSlippageTolerance: number;
}>("user/updateUserSlippageTolerance");
export const updateUserDeadline = createAction<{ userDeadline: number }>("user/updateUserDeadline");
export const addSerializedToken = createAction<{
  serializedToken: SerializedToken;
}>("user/addSerializedToken");
export const removeSerializedToken = createAction<{
  chainId: number;
  address: string;
}>("user/removeSerializedToken");
export const addSerializedPair = createAction<{
  serializedPair: SerializedPair;
}>("user/addSerializedPair");
export const removeSerializedPair = createAction<{
  chainId: number;
  tokenAAddress: string;
  tokenBAddress: string;
}>("user/removeSerializedPair");
export const updateSelectedWallet = createAction<{
  wallet?: ConnectionType;
}>("user/updateSelectedWallet");
// 更新用户的pool信息
export const updatePositions = createAction<{
  positions: any;
}>("user/updatePositions");
export const updateUserSnapshots = createAction<{
  snapshots: LiquidityPositionSnapshot[];
}>("user/updateUserSnapshots");
export const userLogout = createAction("user/logout");
export const loadingPosition = createAction<boolean>("user/loadingPosition");
