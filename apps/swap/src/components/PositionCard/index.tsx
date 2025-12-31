import { JSBI, Pair } from "@repo/sugar-finance-sdk";
import { darken, transparentize } from "polished";
import { useContext, useState } from "react";
import { Text } from "rebass";
import styled, { ThemeContext } from "styled-components";
import { useTotalSupply } from "../../data/TotalSupply";

import { useActiveWeb3React } from "../../hooks";
import { useTokenBalance } from "../../state/wallet/hooks";
import { TYPE } from "../../theme";
import { unwrappedToken } from "../../utils/wrappedCurrency";

import Card from "../Card";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";

export const HoverCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg2};
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`;

interface PositionCardProps {
  pair: Pair;
  showUnwrapped?: boolean;
  border?: string;
}

export function MinimalPositionCard({ pair, showUnwrapped = true }: PositionCardProps) {
  const { account } = useActiveWeb3React();

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0);
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1);

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken);
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const theme = useContext(ThemeContext);

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined];
  return (
    <>
      {userPoolBalance && (
        <AutoColumn gap="8px">
          <RowBetween>
            <RowFixed>
              <TYPE.black fontSize={14} fontWeight={400} color={transparentize(0.5, theme.white)}>
                Your position
              </TYPE.black>
            </RowFixed>
            {/* <RowFixed>
              <Text fontWeight={500}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : "-"}
              </Text>
            </RowFixed> */}
            <div></div>
            {token0Deposited ? (
              <RowFixed>
                <Text fontSize={14}>{currency0.symbol}:</Text>
                <Text fontSize={14} marginLeft={"6px"}>
                  {token0Deposited?.toSignificant(6)}
                </Text>
              </RowFixed>
            ) : (
              "-"
            )}
          </RowBetween>
          <RowBetween>
            <div></div>
            {token1Deposited ? (
              <RowFixed>
                <Text fontSize={14}>{currency1.symbol}:</Text>
                <Text fontSize={14} marginLeft={"6px"}>
                  {token1Deposited?.toSignificant(6)}
                </Text>
              </RowFixed>
            ) : (
              "-"
            )}
          </RowBetween>
        </AutoColumn>
      )}
    </>
  );
}
