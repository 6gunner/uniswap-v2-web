import React from "react";
import { Price } from "@repo/sugar-finance-sdk";
import { useContext } from "react";
import { Repeat } from "react-feather";
import { Text } from "rebass";
import { ThemeContext } from "styled-components";
import { StyledBalanceMaxMini } from "./styleds";
import { useState } from "react";
import { unWrappedCurrency, unwrappedToken, wrappedCurrency } from "@src/utils/wrappedCurrency";

interface TradePriceProps {
  price?: Price;
  showInverted?: boolean;
  setShowInverted?: (showInverted: boolean) => void;
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext);
  const [localShowInverted, setLocalShowInverted] = useState(false);

  const isInverted = showInverted ?? localShowInverted;
  const toggleInverted = setShowInverted ?? setLocalShowInverted;

  const formattedPrice = isInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6);

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency);
  const chainId = price?.baseCurrency.chainId;
  const baseCurrency = unWrappedCurrency(price?.baseCurrency, chainId);
  const quoteCurrency = unWrappedCurrency(price?.quoteCurrency, chainId);
  const label = isInverted
    ? `1 ${baseCurrency?.symbol} = ${formattedPrice ?? "-"} ${quoteCurrency?.symbol}`
    : `1 ${quoteCurrency?.symbol} = ${formattedPrice ?? "-"} ${baseCurrency?.symbol}`;

  return (
    <Text
      fontWeight={500}
      fontSize={14}
      color={theme.white}
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      {show ? (
        <>
          {label}
          <StyledBalanceMaxMini onClick={() => toggleInverted(!isInverted)}>
            <Repeat size={14} />
          </StyledBalanceMaxMini>
        </>
      ) : (
        "-"
      )}
    </Text>
  );
}
