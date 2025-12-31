import { WETH } from "@repo/sugar-finance-sdk";
import { useActiveWeb3React } from "@src/hooks";
import { isSameAddress } from "@src/utils/address";
import { Token } from "@src/utils/returns";
import { Token as SDKToken } from "@repo/sugar-finance-sdk";
import { NATIVE_TOKEN_NAME } from "@src/constants";
function PairName({
  currency0,
  currency1,
}: {
  currency0: Token | SDKToken;
  currency1: Token | SDKToken;
}) {
  const { chainId } = useActiveWeb3React();

  if (chainId && WETH[chainId]) {
    // 判断是否为 ETH/WETH
    const isToken0ETH = isSameAddress(
      WETH[chainId].address,
      "id" in currency0 ? currency0.id : currency0.address
    );
    const isToken1ETH = isSameAddress(
      WETH[chainId].address,
      "id" in currency1 ? currency1.id : currency1.address
    );

    return (
      <>{`${isToken0ETH ? NATIVE_TOKEN_NAME : currency0.symbol}/${isToken1ETH ? NATIVE_TOKEN_NAME : currency1.symbol}`}</>
    );
  }

  return <>{currency0.symbol + "/" + currency1.symbol}</>;
}
export default PairName;
