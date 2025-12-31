import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from "../../constants";
import { createReducer } from "@reduxjs/toolkit";
import { updateVersion } from "../global/actions";
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  updateUserDeadline,
  updateSelectedWallet,
  updatePositions,
  updateUserSnapshots,
  userLogout,
  loadingPosition,
} from "./actions";
import { ConnectionType } from "../../connectors";
import { LiquidityPositionSnapshot, Position } from "@src/utils/returns";

const currentTimestamp = () => new Date().getTime();

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number;

  userDarkMode: boolean | null; // the user's choice for dark mode or light mode
  matchesDarkMode: boolean; // whether the dark mode media query matches

  userExpertMode: boolean;

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number;

  // deadline set by user in minutes, used in all txns
  userDeadline: number;

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken;
    };
  };

  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair;
    };
  };

  timestamp: number;

  selectedWallet?: ConnectionType;

  positions: Position[];

  snapshots: LiquidityPositionSnapshot[];

  isLogout: boolean;

  isLoadingPosition: boolean;
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`;
}

export const initialState: UserState = {
  userDarkMode: false,
  matchesDarkMode: false,
  userExpertMode: false,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  pairs: {},
  timestamp: currentTimestamp(),
  selectedWallet: undefined,
  positions: [],
  snapshots: [],
  isLogout: false,
  isLoadingPosition: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userSlippageTolerance !== "number") {
        state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE;
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userDeadline !== "number") {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW;
      }

      state.lastUpdateVersionTimestamp = currentTimestamp();
    })
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode;
      state.timestamp = currentTimestamp();
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode;
      state.timestamp = currentTimestamp();
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode;
      state.timestamp = currentTimestamp();
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance;
      state.timestamp = currentTimestamp();
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline;
      state.timestamp = currentTimestamp();
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {};
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken;
      state.timestamp = currentTimestamp();
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      state.tokens[chainId] = state.tokens[chainId] || {};
      delete state.tokens[chainId][address];
      state.timestamp = currentTimestamp();
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId;
        state.pairs[chainId] = state.pairs[chainId] || {};
        state.pairs[chainId][
          pairKey(serializedPair.token0.address, serializedPair.token1.address)
        ] = serializedPair;
      }
      state.timestamp = currentTimestamp();
    })
    .addCase(
      removeSerializedPair,
      (state, { payload: { chainId, tokenAAddress, tokenBAddress } }) => {
        if (state.pairs[chainId]) {
          // just delete both keys if either exists
          delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)];
          delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)];
        }
        state.timestamp = currentTimestamp();
      }
    )
    .addCase(updateSelectedWallet, (state, action) => {
      state.selectedWallet = action.payload.wallet;
      state.isLogout = action.payload.wallet ? false : state.isLogout;
    })
    .addCase(updatePositions, (state, action) => {
      state.positions = action.payload.positions;
      state.isLoadingPosition = false;
    })
    .addCase(updateUserSnapshots, (state, action) => {
      state.snapshots = action.payload.snapshots;
      state.isLoadingPosition = false;
    })
    .addCase(userLogout, (state) => {
      state.isLogout = true;
    })
    .addCase(loadingPosition, (state, action) => {
      state.isLoadingPosition = action.payload;
    })
);
