import React, { useEffect, useState } from "react";
import { useMedia } from "react-use";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Box, Flex, Text } from "rebass";
import styled from "styled-components";

import { Divider } from "../Divider";
import { formattedNum } from "@src/utils/swapInfo";
import DoubleTokenLogo from "../DoubleLogo/index";
import { AutoColumn } from "../Column/index";
import { useWeb3React } from "@web3-react/core";
import { ButtonPrimary } from "../Button";
import { Position, Token } from "@src/utils/returns";
import ListSkeleton from "../PairList/ListSkeleton";
import { AppState } from "@src/state";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { isSameAddress } from "@src/utils/address";
import { WETH } from "@repo/sugar-finance-sdk";
import { useActiveWeb3React } from "@src/hooks";
import PairName from "../PariName";
import Empty, { NoDataWrapper } from "../Empty";
import { transparentize } from "polished";

dayjs.extend(utc);

const ListWrapper = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-height: 512px;
`;

const DashGrid = styled.div<{ faded: boolean }>`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1.5fr;
  grid-template-areas: "name liq fees hold return action";
  padding: 0 1.125rem;
  color: ${({ theme }) => transparentize(0.5, theme.black)};
`;

const ClickableText = styled(Text)`
  color: ${({ theme }) => transparentize(0.5, theme.black)};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  font-size: 14px;
  text-align: end;
  user-select: none;
`;

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
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
const RemoveStyledButton = styled(StyledButton)`
  background: rgba(0, 0, 0, 0.05);
  color: #000;
  :hover {
    color: #000;
    background: rgba(0, 0, 0, 0.1);
  }
`;

const PositionList = React.memo(() => {
  const { account } = useWeb3React();
  const { chainId } = useActiveWeb3React();

  const { positions, isLoadingPosition: isLoading } = useSelector((state: AppState) => state.user);
  // debugger;
  const history = useHistory();
  const goToPoolLink = (token0: Token, token1: Token, isRemove = false) => {
    if (!chainId || !WETH[chainId]) return;
    const path = isRemove ? "/remove" : "/add";
    const isToken0ETH = isSameAddress(WETH[chainId].address, token0.id);
    const isToken1ETH = isSameAddress(WETH[chainId].address, token1.id);
    history.push(`${path}/${isToken0ETH ? "eth" : token0.id}/${isToken1ETH ? "eth" : token1.id}`);
  };

  const [listData, setListData] = useState<any>();
  useEffect(() => {
    if (positions && positions.length) {
      const arr = positions.filter(
        (position) => Number(position.liquidityTokenBalance) / Number(position.pair.totalSupply) > 0
      );
      setListData(arr);
    }
  }, [positions]);
  const ListItem = React.memo(({ position }: { position: Position }) => {
    const poolOwnership =
      Number(position.liquidityTokenBalance) / Number(position.pair.totalSupply);
    const valueUSD = poolOwnership * Number(position.pair.reserveUSD);

    return (
      poolOwnership > 0 && (
        <DashGrid
          style={{
            height: "63px",
            cursor: "pointer",
          }}
          faded={false}
        >
          <DataText data-area="name" fontWeight="500">
            <DoubleTokenLogo
              size={26}
              currency0={position.pair.token0}
              currency1={position.pair.token1}
            />
            <PairName currency0={position.pair.token0} currency1={position.pair.token1}></PairName>
          </DataText>
          <DataText data-area="liq" alignItems="center" justifyContent="flex-end">
            <span>{formattedNum(position.pair.reserveUSD, true, true)}</span>
          </DataText>
          <DataText data-area="fees" alignItems="center" justifyContent="flex-end">
            <span>{formattedNum(Number(position?.pair.reserveUSD) * 0.003, true, true)}</span>
          </DataText>
          <DataText data-area="hold" alignItems="center" justifyContent="flex-end">
            <AutoColumn gap="12px" justify="flex-end">
              <span>{formattedNum(valueUSD, true, true)}</span>
              {/* <AutoColumn gap="4px" justify="flex-end">
              <RowFixed>
                <TYPE.small fontWeight={400}>
                  {formattedNum(poolOwnership * parseFloat(position.pair.reserve0))}{" "}
                </TYPE.small>
                <FormattedName
                  text={position.pair.token0.symbol}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={"11px"}
                />
              </RowFixed>
              <RowFixed>
                <TYPE.small fontWeight={400}>
                  {formattedNum(poolOwnership * parseFloat(position.pair.reserve1))}{" "}
                </TYPE.small>
                <FormattedName
                  text={position.pair.token1.symbol}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={"11px"}
                />
              </RowFixed>
            </AutoColumn> */}
            </AutoColumn>
          </DataText>
          <DataText data-area="return" alignItems="center" justifyContent="flex-end">
            <AutoColumn gap="12px" justify="flex-end">
              <span>{formattedNum(position?.fees.sum, true, true)}</span>
              {/* <AutoColumn gap="4px" justify="flex-end">
              <RowFixed>
                <TYPE.small fontWeight={400} error={false}>
                  {parseFloat(position.pair.token0.derivedETH)
                    ? formattedNum(
                        position?.fees.sum /
                          (parseFloat(position.pair.token0.derivedETH) * ethPrice) /
                          2,
                        false,
                        true
                      )
                    : 0}{" "}
                </TYPE.small>
                <FormattedName
                  text={position.pair.token0.symbol}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={"11px"}
                />
              </RowFixed>
              <RowFixed>
                <TYPE.small fontWeight={400}>
                  {parseFloat(position.pair.token1.derivedETH)
                    ? formattedNum(
                        position?.fees.sum /
                          (parseFloat(position.pair.token1.derivedETH) * ethPrice) /
                          2,
                        false,
                        true
                      )
                    : 0}{" "}
                </TYPE.small>
                <FormattedName
                  text={position.pair.token1.symbol}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={"11px"}
                />
              </RowFixed>
            </AutoColumn> */}
            </AutoColumn>
          </DataText>
          <DataText
            data-area="action"
            alignItems="center"
            justifyContent="flex-end"
            style={{ gap: "15px" }}
          >
            <RemoveStyledButton
              onClick={() => goToPoolLink(position.pair.token0, position.pair.token1, true)}
            >
              Remove
            </RemoveStyledButton>

            <StyledButton onClick={() => goToPoolLink(position.pair.token0, position.pair.token1)}>
              Add
            </StyledButton>
          </DataText>
        </DashGrid>
      )
    );
  });

  return (
    <>
      <DashGrid
        style={{
          height: "54px",
          cursor: "pointer",
        }}
        faded={true}
      >
        <Flex alignItems="center" justifyContent="flexStart" fontSize={14}>
          <span data-area="name">Name</span>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end" fontSize={14}>
          <ClickableText>TVL</ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText>Fees</ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText>My Position</ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText>My Reward</ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end" fontSize={14}>
          <span data-area="actions">Actions</span>
        </Flex>
      </DashGrid>
      <Divider />
      {isLoading ? (
        <ListSkeleton />
      ) : (
        <ListWrapper p={0}>
          {account && listData && listData.length ? (
            listData.map((position: Position, index: React.Key | null | undefined) => {
              return (
                <div key={index}>
                  <ListItem key={index} position={position} />
                  <Divider />
                </div>
              );
            })
          ) : (
            <NoDataWrapper>
              {!account ? (
                <Empty text="Wallet Not Connected" imgName="noWallet" />
              ) : (
                <Empty text="No data" imgName="noData" />
              )}
            </NoDataWrapper>
          )}
        </ListWrapper>
      )}
    </>
  );
});

export default PositionList;
