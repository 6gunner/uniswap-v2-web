import { ChainId, WETH } from "@repo/sugar-finance-sdk";

// 实现isSameAddress功能
export function isSameAddress(address1: string, address2: string) {
  return address1.toLowerCase() === address2.toLowerCase();
}
export const isTokenETH = (address: string, chainId: ChainId) => {
  return isSameAddress(address, WETH[chainId].address)
}