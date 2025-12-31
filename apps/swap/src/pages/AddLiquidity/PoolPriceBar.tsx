import { Currency, Percent, Price } from "@repo/sugar-finance-sdk";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { AutoColumn } from "../../components/Column";
import { RowBetween, RowFixed } from "../../components/Row";
import { ONE_BIPS } from "../../constants";
import { Field } from "../../state/mint/actions";
import { TYPE } from "../../theme";
import TradePrice from "@src/components/swap/TradePrice";
import { transparentize } from "polished";

export function PoolPriceBar({
  noLiquidity,
  poolTokenPercentage,
  price,
}: {
  currencies: { [field in Field]?: Currency };
  noLiquidity?: boolean;
  poolTokenPercentage?: Percent;
  price?: Price;
}) {
  const theme = useContext(ThemeContext);
  return (
    <AutoColumn gap="16px" style={{ marginBottom: "1rem" }}>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={14} fontWeight={400} color={transparentize(0.5, theme.white)}>
            {noLiquidity ? "Initial prices" : "Prices"} and pool share{" "}
          </TYPE.black>
        </RowFixed>
        <TradePrice price={price}></TradePrice>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={14} fontWeight={400} color={transparentize(0.5, theme.white)}>
            Share of Pool
          </TYPE.black>
        </RowFixed>
        <RowFixed>
          <TYPE.black fontSize={14} color={theme.white}>
            {noLiquidity && price
              ? "100"
              : ((poolTokenPercentage?.lessThan(ONE_BIPS)
                  ? "<0.01"
                  : poolTokenPercentage?.toFixed(2)) ?? "0")}
            %
          </TYPE.black>
        </RowFixed>
      </RowBetween>
    </AutoColumn>
  );
}
