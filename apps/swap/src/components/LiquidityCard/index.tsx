import { Flex } from "antd";
import styled from "styled-components";
import DoubleCurrencyLogo from "../DoubleLogo";
import { Pair } from "@repo/sugar-finance-sdk";
import { useAllPairData } from "@src/context/PairData";
import { formattedNum, toSignificant } from "@src/utils/swapInfo";
import { HelpCircle } from "react-feather";
import Popover from "../Popover";
import { useState } from "react";
import CurrencyLogo from "../CurrencyLogo";
import { AppState } from "@src/state";
import { useSelector } from "react-redux";
import { unwrappedToken } from "@src/utils/wrappedCurrency";

interface LiquidityCardProps {
  pair: Pair;
}
const Box = styled.div`
  padding: 20px;
  border-radius: var(--padding-p-4, 16px);
  margin-bottom: 24px;
  background: ${({ theme }) => theme.white};
`;

const Title = styled.span`
  color: #000;
  font-family: Comfortaa;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 100%; /* 24px */
`;

const Label = styled.span`
  color: #000;
  text-align: right;
  font-family: Comfortaa;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 100%; /* 14px */
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Value = styled.span<{ size?: number }>`
  color: #000;
  text-align: right;
  font-family: Comfortaa;
  font-size: ${({ size }) => (size ? size : 16)}px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%; /* 16px */
`;

const PopoverContentBox = styled.div`
  padding: 16px;
`;

const Tag = styled.div`
  padding: 3px 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 57px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.5);
  font-weight: 400;
`;
const LiquidityCard = ({ pair }: LiquidityCardProps) => {
  const [showHover, setShowHover] = useState(false);
  const allPairs = useAllPairData();

  const liquidityTokenAddress = pair.liquidityToken.address.toLocaleLowerCase();
  const positions = useSelector((state: AppState) => state.user.positions);
  const userPosition = positions.find((position) => {
    return position.pair.id === liquidityTokenAddress;
  });
  const pairData = allPairs[`${liquidityTokenAddress}`];

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const feePercent = 0.0025;
  const poolOwnership = userPosition?.liquidityTokenBalance / userPosition?.pair?.totalSupply;
  const userPoolBalanceUSD = poolOwnership * userPosition?.pair?.reserveUSD;

  const PopoverContent = () => (
    <PopoverContentBox>
      <Flex vertical gap={16}>
        <Label>Pool balances</Label>
        <Flex align="center" gap={55}>
          <Flex align="center" gap={6}>
            <Value size={14}>{toSignificant(pairData?.reserve0, 8)}</Value>
            <Flex align="center" gap={4}>
              <CurrencyLogo currency={currency0} />
              <Value size={14}>{currency0?.symbol}</Value>
            </Flex>
          </Flex>
          <Flex align="center" gap={6}>
            <Value size={14}>{toSignificant(pairData?.reserve1, 8)}</Value>
            <Flex align="center" gap={4}>
              <CurrencyLogo currency={currency1} />
              <Value size={14}>{currency1?.symbol}</Value>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </PopoverContentBox>
  );
  return (
    <Box>
      <Flex gap={6} align="center">
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={28} margin={true} />
        <Title>
          {currency0?.symbol}/{currency1?.symbol}
        </Title>
        <Tag>{feePercent * 100}%</Tag>
      </Flex>

      <Flex align="center" justify="space-between" style={{ marginTop: 24 }}>
        <Flex vertical gap={12} align="flex-start">
          <Value>{pairData ? formattedNum(pairData.reserveUSD, true, true) : "-"}</Value>
          <Label>
            TVL
            <Popover placement="top" content={<PopoverContent />} show={showHover}>
              <HelpCircle
                onMouseEnter={() => setShowHover(true)}
                onMouseLeave={() => setShowHover(false)}
                size={16}
              />
            </Popover>
          </Label>
        </Flex>
        <Flex vertical gap={12} align="flex-start">
          <Value>
            {pairData ? formattedNum(pairData.volumeUSD * feePercent, true, true) : "-"}
          </Value>
          <Label>Fee</Label>
        </Flex>
        <Flex vertical gap={12} align="flex-start">
          <Value>{pairData ? formattedNum(userPoolBalanceUSD, true, true) : "-"}</Value>
          <Label>My Positions</Label>
        </Flex>
      </Flex>
    </Box>
  );
};

export default LiquidityCard;
