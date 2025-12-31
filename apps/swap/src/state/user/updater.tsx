import { useWeb3React } from "@web3-react/core";
import { useUserPositions, useUserSnapshots } from "./hooks";

export default function Updater(): null {
  const { account } = useWeb3React();
  useUserSnapshots(account || "");
  useUserPositions(account || "");
  return null;
}
