import { Currency, Pair } from "@repo/sugar-finance-sdk";
import { useState, useContext, useCallback } from "react";
import styled, { ThemeContext } from "styled-components";
import { darken } from "polished";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import CurrencySearchModal from "../SearchModal/CurrencySearchModal";
import CurrencyLogo from "../CurrencyLogo";
import DoubleCurrencyLogo from "../DoubleLogo";
import { RowBetween } from "../Row";
import { TYPE } from "../../theme";
import { Input as NumericalInput } from "../NumericalInput";
import DropDown from "../../assets/images/dropdown.svg";

import { useActiveWeb3React } from "../../hooks";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "../SvgIcon";
import PairName from "../PariName";

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 20px 1rem 20px;
`;

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  font-family: Comfortaa;
  height: 38px;
  font-size: 20px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
  border: none;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.primary3};
  outline: none;
  cursor: pointer;
  user-select: none;
  padding: ${({ selected }) => (selected ? "0 6px" : "0 6px")};
  :focus,
  :hover {
    background: rgba(74, 161, 202, 0.1);
  }
  :not(:hover) {
    background-color: transparent;
  }
`;

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 20px 20px 0 20px;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`;

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;
  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
`;

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  z-index: 1;
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? "  margin: 0 0.25rem 0 0.75rem;" : "  margin: 0 0.25rem 0 0.25rem;")}
  font-size:  ${({ active }) => (active ? "18px" : "16px")};
  font-weight: 500;
`;

const StyledBalanceMax = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 0.5rem;
  color: ${({ theme }) => theme.primaryText1};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`;

const StyledBalanceRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px 20px 20px;
`;

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: string;
  onCurrencySelect?: (currency: Currency) => void;
  currency?: Currency | null;
  disableCurrencySelect?: boolean;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  id: string;
  showCommonBases?: boolean;
  hideInputText?: boolean;
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = "Input",
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  hideInputText,
}: CurrencyInputPanelProps) {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined);
  const theme = useContext(ThemeContext);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const handleInputChange = useCallback(
    (val: string) => {
      if (val && currency?.decimals) {
        const parts = val.split(".");
        if (parts.length > 1 && parts[1].length > currency.decimals) {
          // If decimal places exceed currency.decimals, truncate to allowed decimals
          val = `${parts[0]}.${parts[1].slice(0, currency.decimals)}`;
        }
      }
      onUserInput(val);
    },
    [onUserInput, currency]
  );

  return (
    <InputPanel id={id}>
      {!hideInput && !hideInputText && (
        <LabelRow>
          <RowBetween>
            <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
              {label}
            </TYPE.body>
          </RowBetween>
        </LabelRow>
      )}
      <InputRow
        style={hideInput ? { padding: "0", borderRadius: "8px" } : {}}
        selected={disableCurrencySelect}
      >
        {!hideInput && (
          <>
            <NumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={(val) => {
                handleInputChange(val);
              }}
            />
          </>
        )}
        <CurrencySelect
          selected={!!currency}
          className="open-currency-select-button"
          onClick={() => {
            if (!disableCurrencySelect) {
              setModalOpen(true);
            }
          }}
        >
          <Aligner>
            {pair ? (
              <DoubleCurrencyLogo
                currency0={pair.token0}
                currency1={pair.token1}
                size={24}
                margin={true}
              />
            ) : currency ? (
              <CurrencyLogo currency={currency} size={"24px"} />
            ) : null}
            {pair ? (
              <StyledTokenName className="pair-name-container">
                <PairName currency0={pair.token0} currency1={pair.token1} />
              </StyledTokenName>
            ) : (
              <StyledTokenName
                className="token-symbol-container"
                active={Boolean(currency && currency.symbol)}
              >
                {(currency && currency.symbol && currency.symbol.length > 20
                  ? currency.symbol.slice(0, 4) +
                    "..." +
                    currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                  : currency?.symbol) || t("selectToken")}
              </StyledTokenName>
            )}
            {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
          </Aligner>
        </CurrencySelect>
      </InputRow>
      <StyledBalanceRow>
        {account && (
          <TYPE.body
            onClick={onMax}
            color={theme.text2}
            fontWeight={500}
            fontSize={14}
            style={{ display: "flex", cursor: "pointer", alignItems: "center", gap: 4 }}
          >
            <SvgIcon name={"balance"} size={14} />
            {!hideBalance && !!currency && selectedCurrencyBalance
              ? selectedCurrencyBalance?.toSignificant(6)
              : " -"}
          </TYPE.body>
        )}
        {account && currency && showMaxButton && label !== "To" && (
          <StyledBalanceMax onClick={onMax}>Max</StyledBalanceMax>
        )}
      </StyledBalanceRow>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  );
}
