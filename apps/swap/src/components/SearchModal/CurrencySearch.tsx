import { Currency, ETHER, Token } from "@repo/sugar-finance-sdk";
import {
  KeyboardEvent,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { FixedSizeList } from "react-window";
import { useActiveWeb3React } from "../../hooks";
import { useAllTokens, useToken } from "../../hooks/Tokens";
import { isAddress } from "../../utils";
import Column from "../Column";
// import QuestionHelper from '../QuestionHelper'
import { RowBetween } from "../Row";
import CurrencyList from "./CurrencyList";
import { filterTokens } from "./filtering";
import { useTokenComparator } from "./sorting";
import { ModalTitle, PaddedColumn, SearchBox, SearchInput } from "./styleds";
import AutoSizer from "react-virtualized-auto-sizer";
import { SvgIcon } from "../SvgIcon";
import { useSelectedListInfo } from "@src/state/lists/hooks";
import styled, { ThemeContext } from "styled-components";

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  onChangeList: () => void;
}
const SvgIconStyle = styled(SvgIcon)`
  color: rgba(0, 0, 0, 0.5) !important;
  cursor: pointer;
  &:hover {
    color: rgba(0, 0, 0) !important;
  }
`;
export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  onDismiss,
  isOpen,
}: CurrencySearchProps) {
  const { t } = useTranslation();

  const fixedList = useRef<FixedSizeList>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false);
  const allTokens = useAllTokens();
  const theme = useContext(ThemeContext);

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return s === "" || s === "e" || s === "et" || s === "eth";
  }, [searchQuery]);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    return filterTokens(Object.values(allTokens), searchQuery);
  }, [isAddressSearch, searchToken, allTokens, searchQuery]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken];
    const sorted = filteredTokens.sort(tokenComparator);
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter((token) => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter((token) => token.symbol?.toLowerCase() !== symbolMatch[0]),
    ];
  }, [filteredTokens, searchQuery, searchToken, tokenComparator]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect]
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event) => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const s = searchQuery.toLowerCase().trim();
        if (s === "eth") {
          handleCurrencySelect(ETHER);
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0]);
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  );

  return (
    <Column style={{ width: "100%", flex: "1 1" }}>
      <PaddedColumn gap="28px">
        <RowBetween>
          <ModalTitle>Select Token</ModalTitle>
          <SvgIconStyle name={"x"} onClick={onDismiss} size={24} />
        </RowBetween>
        <SearchBox>
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={t("tokenSearchPlaceholder")}
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
          <SvgIcon
            style={{
              width: 20,
              height: 20,
              position: "absolute",
              top: 18,
              left: 15,
              color: theme.text1,
            }}
            name={"search"}
          />
        </SearchBox>
      </PaddedColumn>

      <div style={{ flex: "1", paddingInline: 10 }}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CurrencyList
              height={height}
              showETH={showETH}
              currencies={filteredSortedTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              onDismiss={onDismiss} // 选中关闭弹窗
            />
          )}
        </AutoSizer>
      </div>
    </Column>
  );
}
