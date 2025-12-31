import { Currency, CurrencyAmount, currencyEquals, ETHER, Token } from "@repo/sugar-finance-sdk";
import React, { CSSProperties, MutableRefObject, useCallback, useContext, useMemo } from "react";
import { FixedSizeList } from "react-window";
import { Text } from "rebass";
import styled, { ThemeContext } from "styled-components";
import { useActiveWeb3React } from "../../hooks";
import { useSelectedTokenList, WrappedTokenInfo } from "../../state/lists/hooks";
import { useAddUserToken, useRemoveUserAddedToken } from "../../state/user/hooks";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import { LinkStyledButton, TYPE } from "../../theme";
import { useIsUserAddedToken } from "../../hooks/Tokens";
import Column, { AutoColumn } from "../Column";
import { RowFixed } from "../Row";
import CurrencyLogo from "../CurrencyLogo";
import { MouseoverTooltip } from "../Tooltip";
import { CustomEmpty, FadedSpan, MenuItem } from "./styleds";
import Loader from "../Loader";
import { isTokenOnList } from "../../utils";
import { Flex } from "antd";
import { MinusCircle, PlusCircle } from "react-feather";
import Check_Error from "../../assets/svg/check_error.svg?url";
function currencyKey(currency: Currency): string {
  return currency instanceof Token ? currency.address : currency === ETHER ? "TEXP" : "";
}

const StyledBalanceText = styled(Text)<{ active: boolean }>`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  font-size: 16px;
  font-weight: 500;
  font-family: Comfortaa;
  text-overflow: ellipsis;
  color: ${({ active }) => (active ? "#000" : "rgba(0, 0, 0, 0.6)")};
`;

const TextItemDesc = styled.div`
  color: rgba(0, 0, 0, 0.8);
  font-size: 13px;
  font-weight: 400;
  line-height: 12px;
  font-family: Comfortaa;
  opacity: 0.5;
`;

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`;

function Balance({ balance }: { balance: CurrencyAmount }) {
  console.log(balance.toExact());
  return (
    <StyledBalanceText active={+balance.toExact() > 0} title={balance.toExact()}>
      {balance.toSignificant(4)}
    </StyledBalanceText>
  );
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />;
  }

  const tags = currency.tags;
  if (!tags || tags.length === 0) return <span />;

  const tag = tags[0];

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join("; \n")}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  );
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  onDismiss,
}: {
  currency: Currency;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style: CSSProperties;
  onDismiss: () => void;
}) {
  const { account, chainId } = useActiveWeb3React();
  const key = currencyKey(currency);
  const selectedTokenList = useSelectedTokenList();
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency);
  const customAdded = useIsUserAddedToken(currency);
  const balance = useCurrencyBalance(account ?? undefined, currency);
  const theme = useContext(ThemeContext);
  const removeToken = useRemoveUserAddedToken();
  const addToken = useAddUserToken();

  // only show add or remove buttons if not on selected list
  return (
    <div style={style}>
      <MenuItem
        className={`token-item-${key}`}
        onClick={onSelect}
        // disabled={isSelected}
        selected={otherSelected}
      >
        <CurrencyLogo currency={currency} size={"36px"} />
        <Column>
          <AutoColumn gap="6px">
            <Flex align="center">
              <Text
                color={theme.text1}
                title={currency.name}
                style={{ lineHeight: "16px" }}
                fontWeight={500}
              >
                {currency.symbol}
              </Text>
              <FadedSpan>
                {!isOnSelectedList && customAdded ? (
                  <TYPE.main fontWeight={500}>
                    <LinkStyledButton
                      onClick={(event) => {
                        event.stopPropagation();
                        if (chainId && currency instanceof Token)
                          removeToken(chainId, currency.address);
                      }}
                    >
                      <MinusCircle size={16} />
                    </LinkStyledButton>
                  </TYPE.main>
                ) : null}
                {!isOnSelectedList && !customAdded ? (
                  <TYPE.main fontWeight={500}>
                    <LinkStyledButton
                      onClick={(event) => {
                        event.stopPropagation();
                        if (currency instanceof Token) {
                          addToken(currency);
                          onSelect();
                          onDismiss();
                        }
                      }}
                    >
                      <PlusCircle size={16} />
                    </LinkStyledButton>
                  </TYPE.main>
                ) : null}
              </FadedSpan>
            </Flex>
            <TextItemDesc title={currency.name}>{currency.name}</TextItemDesc>
          </AutoColumn>
        </Column>
        <TokenTags currency={currency} />
        <RowFixed style={{ justifySelf: "flex-end" }}>
          {balance ? (
            <Balance balance={balance} />
          ) : account ? (
            <Loader stroke={theme.primaryText1} />
          ) : null}
        </RowFixed>
      </MenuItem>
    </div>
  );
}

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH,
  onDismiss,
}: {
  height: number;
  currencies: Currency[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherCurrency?: Currency | null;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
  showETH: boolean;
  onDismiss: () => void;
}) {
  const itemData = useMemo(
    () => (showETH ? [Currency.ETHER, ...currencies] : currencies),
    [currencies, showETH]
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency));
      const handleSelect = () => onCurrencySelect(currency);
      return (
        <CurrencyRow
          onDismiss={onDismiss}
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      );
    },
    [onCurrencySelect, otherCurrency, selectedCurrency]
  );

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), []);
  return itemData?.length ? (
    <FixedSizeList
      height={height}
      style={{
        overflowY: "scroll", // 确保有滚动效果
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none",
      }}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={72}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  ) : (
    <CustomEmpty>
      <img src={Check_Error} alt="check_error" />
      <span>No result</span>
    </CustomEmpty>
  );
}
