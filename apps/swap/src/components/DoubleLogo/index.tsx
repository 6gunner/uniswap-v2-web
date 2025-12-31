import { Currency, ETHER } from "@repo/sugar-finance-sdk";
import styled from "styled-components";
import { Avatar } from "antd";
import { HelpCircle } from "react-feather";
import { NameToIcon } from "../NameToIcon";
import CurrencyLogo from "../CurrencyLogo";
import { useAllTokens, useToken } from "@src/hooks/Tokens";

interface CurrencyAndListItem extends Currency {
  id?: string;
}
interface DoubleCurrencyLogoProps {
  marginRight?: number;
  margin?: boolean;
  size?: number;
  currency0?: CurrencyAndListItem;
  currency1?: CurrencyAndListItem;
}

const AvatarGroup = styled(Avatar.Group)<{ marginRight: number; margin: boolean }>`
  margin-right: ${(props) => props.marginRight}px;
`;

const NoSymbolIcon = styled(HelpCircle)`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: #fff;
  border-radius: 100%;
`;

export const getCurrentToken = (currency: Currency) => {
  const tokens = useAllTokens();
  const currentToken = Object.values(tokens).find((item) => {
    return item?.symbol === currency?.symbol;
  });
  return currentToken !== undefined ? currentToken : currency.symbol === "ETH" ? ETHER : currency;
};
const getToken = (tokenAddress?: string) => {
  const token = useToken(tokenAddress);
  return token;
};
export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 6,
  marginRight = 8,
  margin = true,
}: DoubleCurrencyLogoProps) {
  return (
    <AvatarGroup margin={margin} max={{ count: 2 }} marginRight={marginRight}>
      {[currency0, currency1]?.map((currency, index) => {
        if (!currency) {
          return <NoSymbolIcon size={size} key={index} />;
        }

        if (currency.symbol && !currency.id) {
          return (
            <CurrencyLogo
              currency={getCurrentToken(currency)}
              size={`${size}px`}
              key={currency.symbol}
            />
          );
        }

        if (currency.id) {
          const token = getToken(currency.id);
          if (token) {
            return <CurrencyLogo currency={token} size={`${size}px`} key={currency.symbol} />;
          }
        }

        return <NameToIcon size={size} name={currency.symbol} key={currency.symbol} />;
      })}
    </AvatarGroup>
  );
}
