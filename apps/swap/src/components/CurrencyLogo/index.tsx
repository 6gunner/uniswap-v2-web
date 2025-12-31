import React, { useMemo } from "react";
import { Currency, ETHER, Token } from "@repo/sugar-finance-sdk";
import styled from "styled-components";

import useHttpLocations from "../../hooks/useHttpLocations";
import { WrappedTokenInfo } from "../../state/lists/hooks";
import Logo from "../Logo";

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`;

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

const getTokenLogoURL = (symbol?: string): string => {
  if (!symbol) return "";
  return `${import.meta.env.VITE_STATIC_URL}/${symbol}.png`;
};

export default function CurrencyLogo({
  currency,
  size = "24px",
  style,
}: {
  currency?: Currency | Token | WrappedTokenInfo | null;
  size?: string;
  style?: React.CSSProperties;
}) {
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo ? currency.logoURI : undefined
  );
  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return [];

    if (currency instanceof Token) {
      const logoURL = getTokenLogoURL(currency.symbol);
      return logoURL ? [...uriLocations, logoURL] : uriLocations;
    }
    return [];
  }, [currency, uriLocations]);

  if (currency === ETHER) {
    return (
      <StyledEthereumLogo src={`${getTokenLogoURL(ETHER.symbol)}`} size={size} style={style} />
    );
  }
  return (
    <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} style={style} />
  );
}
