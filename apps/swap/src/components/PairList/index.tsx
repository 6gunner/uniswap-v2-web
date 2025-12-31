import React, { useState, useEffect } from "react";
import { useMedia } from "react-use";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Box, Flex, Text } from "rebass";
import styled from "styled-components";

import { Divider } from "../Divider";
import { formattedNum } from "@src/utils/swapInfo";
import DoubleTokenLogo from "../DoubleLogo/index";
import { TYPE } from "../../theme/index";
import { PAIR_BLACKLIST } from "../../constants/index";
import { AutoColumn } from "../Column/index";
import { ButtonPrimary } from "../Button";
import { transparentize } from "polished";
import { useAllPairData } from "@src/context/PairData";
import ListSkeleton from "./ListSkeleton";
import { Token, WETH } from "@repo/sugar-finance-sdk";
import { useActiveWeb3React } from "@src/hooks";
import { isSameAddress } from "@src/utils/address";
import PairName from "../PariName";
import Empty, { NoDataWrapper } from "../Empty";
import { useWeb3React } from "@web3-react/core";
import tokenList from "@src/assets/sepoliaTokenList.json";

dayjs.extend(utc);

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-height: 512px;
`;

const DashGrid = styled.div<{ faded: boolean }>`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1.5fr;
  grid-template-areas: " name liq vol volWeek fees action";
  padding: 0 1.125rem;
  color: ${({ theme }) => transparentize(0.5, theme.black)};
  > * {
    justify-content: flex-end;
    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }
`;

const ClickableText = styled(Text)`
  color: ${({ theme }) => transparentize(0.5, theme.black)};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`;

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  & > * {
    font-size: 16px;
  }
  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const StyledButton = styled(ButtonPrimary)`
  display: flex;
  width: 72px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText1};
  background: rgba(74, 161, 202, 0.2);
  :hover {
    background: ${({ theme }) => theme.primaryText1};
    color: ${({ theme }) => theme.white};
  }
`;

const SORT_FIELD = {
  LIQ: 0,
  NAME: 1,
  FEES: 2,
  VOL: 3,
  VOL_7DAYS: 4,
};

const FIELD_TO_VALUE = (field: number, useTracked = false) => {
  switch (field) {
    case SORT_FIELD.LIQ:
      return useTracked ? "trackedReserveUSD" : "reserveUSD";
    case SORT_FIELD.VOL:
      return useTracked ? "oneDayVolumeUSD" : "oneDayVolumeUntracked";
    case SORT_FIELD.VOL_7DAYS:
      return useTracked ? "oneWeekVolumeUSD" : "oneWeekVolumeUntracked";
    case SORT_FIELD.FEES:
      return useTracked ? "oneDayVolumeUSD" : "oneDayVolumeUntracked";
    default:
      return "trackedReserveUSD";
  }
};

const formatDataText = (value: string, trackedValue: string, supressWarning = false) => {
  const showUntracked = value !== "$0" && !trackedValue && !supressWarning;
  return (
    <AutoColumn gap="2px" style={{ opacity: showUntracked ? "0.7" : "1" }}>
      <div style={{ textAlign: "right" }}>{value}</div>
      <TYPE.light fontSize={"9px"} style={{ textAlign: "right" }} error={false}>
        {showUntracked ? "untracked" : "  "}
      </TYPE.light>
    </AutoColumn>
  );
};

const SYMBOLS = tokenList.tokens.map((token) => token.address.toLowerCase());
// 实际上就是流动性池子列表
const PairList = React.memo(() => {
  // pagination
  const [page, setPage] = useState(1);
  const { account } = useWeb3React();
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  const { chainId } = useActiveWeb3React();
  // sorting
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ);

  const history = useHistory();
  const goToPoolLink = (token0: any, token1: any) => {
    if (!chainId || !WETH[chainId]) return;
    const isToken0ETH = isSameAddress(WETH[chainId].address, token0.id);
    const isToken1ETH = isSameAddress(WETH[chainId].address, token1.id);
    history.push(`/add/${isToken0ETH ? "eth" : token0.id}/${isToken1ETH ? "eth" : token1.id}`);
  };

  const pairs = useAllPairData();
  const isLoading = Object.keys(pairs).length <= 0; // todo 怎么判断？

  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [pairs]);

  useEffect(() => {
    if (pairs) {
      let extraPages = 1;
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages);
    }
  }, [ITEMS_PER_PAGE, pairs]);

  const ListItem = ({ pairAddress }: { pairAddress: string; index: number }) => {
    const pairData = pairs[pairAddress];
    const feePercent = 0.003;

    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(
        pairData.trackedReserveUSD ? pairData.trackedReserveUSD : pairData.reserveUSD,
        true
      );

      // 24小时交易量
      const volume = formattedNum(
        pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked,
        true
      );
      // 7天交易量
      const weekVolume = formattedNum(
        pairData.oneWeekVolumeUSD ? pairData.oneWeekVolumeUSD : pairData.oneWeekVolumeUntracked,
        true
      );

      const fees = formattedNum(
        pairData.volumeUSD
          ? pairData.volumeUSD * feePercent
          : pairData.untrackedVolumeUSD * feePercent,
        true
      );

      return (
        <DashGrid
          style={{
            height: "64px",
            cursor: "pointer",
            borderBottom: "1px solid rgba(0, 0, 0, 0.10)",
          }}
          faded={false}
        >
          <DataText data-area="name" fontWeight="500">
            <DoubleTokenLogo size={26} currency0={pairData.token0} currency1={pairData.token1} />
            <PairName currency0={pairData.token0} currency1={pairData.token1}></PairName>
          </DataText>
          <DataText data-area="liq">
            {formatDataText(liquidity.toString(), pairData.trackedReserveUSD)}
          </DataText>
          <DataText data-area="fees">{formatDataText(fees.toString(), fees.toString())}</DataText>
          <DataText data-area="vol">
            {formatDataText(volume.toString(), pairData.oneDayVolumeUSD)}
          </DataText>

          <DataText data-area="volWeek">
            {formatDataText(weekVolume.toString(), pairData.oneWeekVolumeUSD)}
          </DataText>

          <DataText data-area="action">
            <StyledButton onClick={() => goToPoolLink(pairData.token0, pairData.token1)}>
              Add
            </StyledButton>
          </DataText>
        </DashGrid>
      );
    } else {
      return "";
    }
  };

  const pairList =
    pairs &&
    Object.keys(pairs)
      .filter((address: string) => !PAIR_BLACKLIST.includes(address) && true)
      .filter((address: string) => {
        const pair = pairs[address];
        if (pair && pair.token0 && pair.token1) {
          return SYMBOLS.includes(pair.token0.id) && SYMBOLS.includes(pair.token1.id);
        }
        return false;
      })
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA];
        const pairB = pairs[addressB];
        // if (sortedColumn === SORT_FIELD.APY) {
        //   // 计算一年的fees/liquidity
        //   const apy0 =
        //     parseFloat(pairA.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairA.reserveUSD);
        //   const apy1 =
        //     parseFloat(pairB.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairB.reserveUSD);
        //   return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1;
        // }
        return parseFloat(pairA[FIELD_TO_VALUE(sortedColumn, false)]) >
          parseFloat(pairB[FIELD_TO_VALUE(sortedColumn, false)])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1;
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <ListItem
              key={index}
              index={(page - 1) * ITEMS_PER_PAGE + index + 1}
              pairAddress={pairAddress}
            />
          )
        );
      });

  return (
    <>
      <DashGrid
        style={{ height: "54px", padding: "0 1.125rem", alignItems: "center" }}
        faded={true}
      >
        <Flex alignItems="center" justifyContent="flexStart" fontSize={14}>
          <span data-area="name">Name</span>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd" fontSize={14}>
          <ClickableText
            data-area="liq"
            onClick={() => {
              setSortedColumn(SORT_FIELD.LIQ);
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection);
            }}
          >
            TVL
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd" fontSize={14}>
          <ClickableText
            data-area="fees"
            onClick={() => {
              setSortedColumn(SORT_FIELD.FEES);
              setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection);
            }}
          >
            Fees
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd" fontSize={14}>
          <ClickableText
            data-area="vol"
            onClick={() => {
              setSortedColumn(SORT_FIELD.VOL);
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection);
            }}
          >
            Volume (24hrs)
          </ClickableText>
        </Flex>

        <Flex alignItems="center" justifyContent="flexEnd" fontSize={14}>
          <ClickableText
            data-area="volWeek"
            onClick={() => {
              setSortedColumn(SORT_FIELD.VOL_7DAYS);
              setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection);
            }}
          >
            Volume (7d){" "}
          </ClickableText>
        </Flex>

        <Flex alignItems="center" justifyContent="flexEnd" fontSize={14}>
          Actions
        </Flex>
      </DashGrid>
      <Divider />
      {isLoading ? (
        <ListSkeleton />
      ) : account && pairList.length ? (
        <List p={0}>{pairList}</List>
      ) : (
        <NoDataWrapper>
          {!account ? (
            <Empty text="Wallet Not Connected" imgName="noWallet" />
          ) : (
            <Empty text="No data" imgName="noData" />
          )}
        </NoDataWrapper>
      )}

      {/* !account ? 'Wallet Not Connected' : error ? '查询失败' : 'No data'  */}
      {/* 分页 */}
      {/* <PageButtons>
        <div
          onClick={(e) => {
            setPage(page === 1 ? page : page - 1);
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{"Page " + page + " of " + maxPage}</TYPE.body>
        <div
          onClick={(e) => {
            setPage(page === maxPage ? page : page + 1);
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons> */}
    </>
  );
});

export default PairList;
