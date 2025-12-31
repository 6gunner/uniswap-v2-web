import { BigNumber } from "@ethersproject/bignumber";
import { TransactionResponse } from "@ethersproject/providers";
import {
  ChainId,
  Currency,
  currencyEquals,
  ETHER,
  TokenAmount,
  WETH,
} from "@repo/sugar-finance-sdk";
import { useCallback, useContext, useState } from "react";
import { Box, Text } from "rebass";
import { ThemeContext } from "styled-components";
import { ButtonError, ButtonPrimary } from "../../components/Button";
import { BlueCard, OutlineCard } from "../../components/Card";
import { AutoColumn, ColumnCenter } from "../../components/Column";
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from "../../components/TransactionConfirmationModal";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import DoubleCurrencyLogo from "../../components/DoubleLogo";
import { LiquidityTabs } from "../../components/NavigationTabs";
import { AddRemoveGoback } from "../../components/AddRemoveGoback";
import LiquidityCard from "../../components/LiquidityCard";
import { MinimalPositionCard } from "../../components/PositionCard";
import Row, { AutoRow, AutoRowBox, RowBetween, RowFlat } from "../../components/Row";

import { ROUTER_ADDRESS } from "../../constants";
import { PairState } from "../../data/Reserves";
import { useActiveWeb3React } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import { ApprovalState, useApproveCallback } from "../../hooks/useApproveCallback";
import { useWalletModalToggle } from "../../state/application/hooks";
import { Field } from "../../state/mint/actions";
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from "../../state/mint/hooks";

import { useTransactionAdder } from "../../state/transactions/hooks";
import { useIsExpertMode, useUserDeadline, useUserSlippageTolerance } from "../../state/user/hooks";
import { TYPE } from "../../theme";
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from "../../utils";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { wrappedCurrency } from "../../utils/wrappedCurrency";
import AppBody from "../AppBody";
import { ArrowWrapper, ShdowBox, SplitLine, TruncatedText } from "@src/components/swap/styleds";
import { Wrapper } from "../Pool/styleds";

import { ConfirmAddModalBottom } from "./ConfirmAddModalBottom";
import { currencyId } from "../../utils/currencyId";
import { PoolPriceBar } from "./PoolPriceBar";
import { SvgIcon } from "../../components/SvgIcon";
import Loader from "@src/components/Loader";
import { RouteComponentProps } from "react-router";

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, library } = useActiveWeb3React();
  const theme = useContext(ThemeContext);
  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);
  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WETH[chainId])) ||
        (currencyB && currencyEquals(currencyB, WETH[chainId])))
  );

  const toggleWalletModal = useWalletModalToggle();

  const expertMode = useIsExpertMode();

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState();
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const [deadline] = useUserDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>("");

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity
      ? otherTypedValue
      : (parsedAmounts[dependentField]?.toSignificant(6) ?? ""),
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(currencyBalances[field]),
    };
  }, {});

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? "0"),
    };
  }, {});

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback, isApprovalLoadingA] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    ROUTER_ADDRESS
  );
  const [approvalB, approveBCallback, isApprovalLoadingB] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    ROUTER_ADDRESS
  );

  const addTransaction = useTransactionAdder();

  async function onAdd() {
    if (!chainId || !library || !account) return;
    const router = getRouterContract(chainId, library, account);

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return;
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        parsedAmountA,
        noLiquidity ? 0 : allowedSlippage
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        parsedAmountB,
        noLiquidity ? 0 : allowedSlippage
      )[0],
    };

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null;
    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER;
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? "", // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadlineFromNow,
      ];
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? "",
        wrappedCurrency(currencyB, chainId)?.address ?? "",
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadlineFromNow,
      ];
      value = null;
    }

    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          setAttemptingTxn(false);

          addTransaction(response, {
            summary:
              "Add " +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              " " +
              currencies[Field.CURRENCY_A]?.symbol +
              " and " +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              " " +
              currencies[Field.CURRENCY_B]?.symbol,
            title: ["Liquidity Added", "Liquidity Addition Failed"],
            currency0Symbol: parsedAmounts[Field.CURRENCY_A]?.currency.symbol,
            currency1Symbol: parsedAmounts[Field.CURRENCY_B]?.currency.symbol,
          });

          setTxHash(response.hash);
        })
      )
      .catch((error) => {
        setAttemptingTxn(false);
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <Box mt="20px">
          <RowFlat>
            <Text
              fontSize="48px"
              fontWeight={500}
              lineHeight="42px"
              marginRight={10}
              color={theme.text1}
            >
              {currencies[Field.CURRENCY_A]?.symbol + "/" + currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </RowFlat>
        </Box>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: "20px" }}>
          <TruncatedText fontSize={48} fontWeight={500} lineHeight={"45px"} marginRight={10}>
            {liquidityMinted?.toSignificant(6)}
          </TruncatedText>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat>
        <Row>
          <Text fontSize="24px" color={theme.text1}>
            {currencies[Field.CURRENCY_A]?.symbol +
              "/" +
              currencies[Field.CURRENCY_B]?.symbol +
              " Pool Tokens"}
          </Text>
        </Row>
        <TYPE.main
          fontSize={12}
          textAlign="left"
          padding={"8px 0 0 0 "}
          style={{ width: "100%", textWrap: "wrap" }}
        >
          {`Output is estimated. If the price changes by more than ${
            allowedSlippage / 100
          }% your transaction will revert.`}
        </TYPE.main>
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    );
  };

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`;

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA);
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/add/${currencyIdB}/${currencyIdA}`);
      } else {
        history.push(`/add/${newCurrencyIdA}/${currencyIdB}`);
      }
    },
    [currencyIdB, history, currencyIdA]
  );
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB);
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          history.push(`/add/${newCurrencyIdB}`);
        }
      } else {
        history.push(`/add/${currencyIdA ? currencyIdA : "ETH"}/${newCurrencyIdB}`);
      }
    },
    [currencyIdA, history, currencyIdB]
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput("");
    }
    setTxHash("");
  }, [onFieldAInput, txHash]);
  const transactionText = `You will receive ${liquidityMinted?.toSignificant(6)} ${currencies[Field.CURRENCY_A]?.symbol + "/" + currencies[Field.CURRENCY_B]?.symbol}`;

  return (
    <div style={{ width: "inherit", display: "flex", justifyContent: "center", marginTop: -12 }}>
      <AddRemoveGoback />
      <AppBody>
        {pair && pairState !== PairState.INVALID && <LiquidityCard pair={pair} />}
        <AutoColumn gap="24px">
          {noLiquidity && (
            <ColumnCenter>
              <BlueCard>
                <AutoColumn gap="10px">
                  <TYPE.link fontWeight={600} color={"errorRed"}>
                    You are the first liquidity provider.
                  </TYPE.link>
                  <TYPE.link fontWeight={400} color={"errorRed"}>
                    The ratio of tokens you add will set the price of this pool.
                  </TYPE.link>
                  <TYPE.link fontWeight={400} color={"errorRed"}>
                    Once you are happy with the rate click supply to review.
                  </TYPE.link>
                </AutoColumn>
              </BlueCard>
            </ColumnCenter>
          )}
          <LiquidityTabs adding={true} />
          <Wrapper>
            <TransactionConfirmationModal
              isOpen={showConfirm}
              onDismiss={handleDismissConfirmation}
              attemptingTxn={attemptingTxn}
              hash={txHash}
              content={() => (
                <ConfirmationModalContent
                  title={noLiquidity ? "You are creating a pool" : "You will receive"}
                  onDismiss={handleDismissConfirmation}
                  topContent={modalHeader}
                  bottomContent={modalBottom}
                />
              )}
              pendingText={pendingText}
              transactionText={transactionText}
            />
            <ShdowBox style={{ marginBottom: 24 }} id="pool-page">
              <CurrencyInputPanel
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onFieldAInput}
                onMax={() => {
                  onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? "");
                }}
                onCurrencySelect={handleCurrencyASelect}
                disableCurrencySelect={true}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                currency={currencies[Field.CURRENCY_A]}
                id="add-liquidity-input-tokena"
                showCommonBases
              />
              <ColumnCenter>
                <ArrowWrapper clickable={false}>
                  <SvgIcon
                    name="circle-plus"
                    style={{
                      width: "36px",
                      height: "36px",
                      color: "#000",
                    }}
                  />
                </ArrowWrapper>
                <SplitLine />
              </ColumnCenter>
              <CurrencyInputPanel
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onFieldBInput}
                onCurrencySelect={handleCurrencyBSelect}
                onMax={() => {
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? "");
                }}
                disableCurrencySelect={true}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                currency={currencies[Field.CURRENCY_B]}
                id="add-liquidity-input-tokenb"
                showCommonBases
              />
            </ShdowBox>

            {!account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
            ) : (
              <AutoColumn gap={"md"}>
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          fontSize={18}
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING || isApprovalLoadingA}
                          altDisabledStyle={
                            approvalA === ApprovalState.PENDING || isApprovalLoadingA
                          }
                          width={approvalB !== ApprovalState.APPROVED ? "48%" : "100%"}
                        >
                          {approvalA === ApprovalState.PENDING || isApprovalLoadingA ? (
                            // <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                            <AutoRow fontSize={18} gap="6px" justify="center">
                              <AutoRowBox>
                                <Loader stroke="rgba(74, 161, 202, 0.8)" /> Approving{" "}
                                {/* {currencies[Field.CURRENCY_A]?.symbol} */}
                              </AutoRowBox>
                            </AutoRow>
                          ) : (
                            "Approve " + currencies[Field.CURRENCY_A]?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          fontSize={18}
                          onClick={approveBCallback}
                          altDisabledStyle={
                            approvalB === ApprovalState.PENDING || isApprovalLoadingB
                          }
                          disabled={approvalB === ApprovalState.PENDING || isApprovalLoadingB}
                          width={approvalA !== ApprovalState.APPROVED ? "48%" : "100%"}
                        >
                          {approvalB === ApprovalState.PENDING || isApprovalLoadingB ? (
                            // <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                            <AutoRow fontSize={18} gap="6px" justify="center">
                              <AutoRowBox>
                                <Loader stroke="rgba(74, 161, 202, 0.8)" /> Approving{" "}
                                {/* {currencies[Field.CURRENCY_B]?.symbol} */}
                              </AutoRowBox>
                            </AutoRow>
                          ) : (
                            "Approve " + currencies[Field.CURRENCY_B]?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                <ButtonError
                  onClick={() => {
                    expertMode ? onAdd() : setShowConfirm(true);
                  }}
                  disabled={
                    !isValid ||
                    approvalA !== ApprovalState.APPROVED ||
                    approvalB !== ApprovalState.APPROVED
                  }
                  error={
                    !isValid &&
                    !!parsedAmounts[Field.CURRENCY_A] &&
                    !!parsedAmounts[Field.CURRENCY_B]
                  }
                >
                  <Text fontSize={20} fontWeight={500}>
                    {error ?? "Supply"}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )}
          </Wrapper>
          {currencies[Field.CURRENCY_A] &&
            currencies[Field.CURRENCY_B] &&
            pairState !== PairState.INVALID && (
              <>
                <OutlineCard padding="20px" borderRadius={"20px"}>
                  <PoolPriceBar
                    currencies={currencies}
                    poolTokenPercentage={poolTokenPercentage}
                    noLiquidity={noLiquidity}
                    price={price}
                  />
                  {!noLiquidity && pair && (
                    <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                  )}
                </OutlineCard>
              </>
            )}
        </AutoColumn>
      </AppBody>
    </div>
  );
}
