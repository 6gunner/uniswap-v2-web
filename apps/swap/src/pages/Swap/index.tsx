import { CurrencyAmount, JSBI, Token, Trade } from "@repo/sugar-finance-sdk";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ArrowDown } from "react-feather";

import { Text } from "rebass";
import { ThemeContext } from "styled-components";
import AddressInputPanel from "../../components/AddressInputPanel";
import { ButtonPrimary, ButtonConfirmed } from "../../components/Button";
import { GreyCard } from "../../components/Card";
import { AutoColumn, ColumnCenter } from "../../components/Column";
import ConfirmSwapModal from "../../components/swap/ConfirmSwapModal";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import { AutoRow, RowBetween } from "../../components/Row";
import AdvancedSwapDetailsDropdown from "../../components/swap/AdvancedSwapDetailsDropdown";
import confirmPriceImpactWithoutFee from "../../components/swap/confirmPriceImpactWithoutFee";
import {
  ArrowWrapper,
  BottomGrouping,
  ShdowBox,
  SplitLine,
  SvgIconBox,
  SwapWraning,
} from "../../components/swap/styleds";
import TradePrice from "../../components/swap/TradePrice";
import TokenWarningModal from "../../components/TokenWarningModal";

import { useActiveWeb3React, useIsSupportedNetwork } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import { ApprovalState, useApproveCallbackFromTrade } from "../../hooks/useApproveCallback";
import useENSAddress from "../../hooks/useENSAddress";
import { useSwapCallback } from "../../hooks/useSwapCallback";
import useToggledVersion, { Version } from "../../hooks/useToggledVersion";
import useWrapCallback, { WrapType } from "../../hooks/useWrapCallback";
import { useToggleSettingsMenu, useWalletModalToggle } from "../../state/application/hooks";
import { Field } from "../../state/swap/actions";
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from "../../state/swap/hooks";
import {
  useExpertModeManager,
  useUserDeadline,
  useUserSlippageTolerance,
} from "../../state/user/hooks";
import { LinkStyledButton, TYPE } from "../../theme";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { computeTradePriceBreakdown, warningSeverity } from "../../utils/prices";
import AppBody from "../AppBody";
import Loader from "../../components/Loader";
import Settings from "@src/components/Settings";
import { SvgIcon } from "../../components/SvgIcon";
import { useSwitchChain } from "@src/hooks/useSwitchNetwork";
import { NETWORK_CHAIN_ID } from "@src/connectors";
import { transparentize } from "polished";

export default function Swap() {
  const loadedUrlParams = useDefaultsFromURLSearch();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false);
  const urlLoadedTokens: Token[] = useMemo(
    () =>
      [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ??
      [],
    [loadedInputCurrency, loadedOutputCurrency]
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  const { account } = useActiveWeb3React();
  const isSupportedNetwork = useIsSupportedNetwork();
  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // for expert mode
  const toggleSettings = useToggleSettingsMenu();
  const [isExpertMode] = useExpertModeManager();

  // get custom setting values for user
  const [deadline] = useUserDeadline();
  const [allowedSlippage] = useUserSlippageTolerance();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);
  //
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENSAddress(recipient);
  const toggledVersion = useToggledVersion();
  const trade = showWrap
    ? undefined
    : {
        [Version.v1]: v1Trade,
        [Version.v2]: v2Trade,
      }[toggledVersion];

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      };

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } =
    useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput]
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput]
  );

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] =
    useState<{
      showConfirm: boolean;
      tradeToConfirm: Trade | undefined;
      attemptingTxn: boolean;
      swapErrorMessage: string | undefined;
      txHash: string | undefined;
    }>({
      showConfirm: false,
      tradeToConfirm: undefined,
      attemptingTxn: false,
      swapErrorMessage: undefined,
      txHash: undefined,
    });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? (parsedAmounts[independentField]?.toExact() ?? "")
      : (parsedAmounts[dependentField]?.toSignificant(6) ?? ""),
  };

  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback, isLoading] = useApproveCallbackFromTrade(
    trade,
    allowedSlippage
  );

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);
  // const [isApproving, setIsApproving] = useState<boolean>(false);
  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(
    maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput)
  );

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  );

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    });
    swapCallback()
      .then((hash) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
        });
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [
    tradeToConfirm,
    account,
    priceImpactWithoutFee,
    recipient,
    recipientAddress,
    showConfirm,
    swapCallback,
    trade,
  ]);

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, "");
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection]
  );

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  );

  const switchNetwork = useSwitchChain();

  return (
    <>
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <AppBody>
        <RowBetween>
          <Text fontSize={18} fontWeight="500" lineHeight="100%">
            Go on, swap.
          </Text>
          <Settings />
        </RowBetween>
        <ShdowBox id="swap-page" style={{ marginTop: 20 }}>
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            errorHidden={true}
            onDismiss={handleConfirmDismiss}
          />
          <AutoColumn gap="0">
            <CurrencyInputPanel
              label={
                independentField === Field.OUTPUT && !showWrap && trade
                  ? "Sell (estimated)"
                  : "Sell"
              }
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <ColumnCenter>
              <ArrowWrapper clickable={false}>
                <SvgIconBox size={36}>
                  <SvgIcon
                    name="switch"
                    style={{
                      width: "20px",
                      height: "20px",
                      color: "#000",
                    }}
                    onClick={() => {
                      setApprovalSubmitted(false); // reset 2 step UI for approvals
                      onSwitchTokens();
                    }}
                  />
                </SvgIconBox>
              </ArrowWrapper>
              <SplitLine />
            </ColumnCenter>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={
                independentField === Field.INPUT && !showWrap && trade ? "Buy (estimated)" : "Buy"
              }
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />
            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: "0 1rem" }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton
                    id="remove-recipient-button"
                    onClick={() => onChangeRecipient(null)}
                  >
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
          </AutoColumn>
        </ShdowBox>
        {/* 按钮区域 */}
        <BottomGrouping>
          {!account ? (
            <ButtonPrimary fontSize={18} onClick={toggleWalletModal}>
              Connect Wallet
            </ButtonPrimary>
          ) : !isSupportedNetwork ? (
            <ButtonPrimary fontSize={18} onClick={() => switchNetwork(NETWORK_CHAIN_ID)}>
              Switch Network
            </ButtonPrimary>
          ) : showWrap ? (
            <ButtonPrimary fontSize={18} disabled={Boolean(wrapInputError)} onClick={onWrap}>
              {wrapInputError ??
                (wrapType === WrapType.WRAP
                  ? "Wrap"
                  : wrapType === WrapType.UNWRAP
                    ? "Unwrap"
                    : null)}
            </ButtonPrimary>
          ) : noRoute && userHasSpecifiedInputOutput ? (
            <GreyCard
              style={{
                textAlign: "center",
                border: "none",
                background: transparentize(0.7, "#fff"),
              }}
            >
              <TYPE.main fontSize={18} color={"rgba(74, 161, 202, 1)"}>
                Insufficient liquidity for this trade.
              </TYPE.main>
            </GreyCard>
          ) : showApproveFlow ? (
            <RowBetween>
              <ButtonConfirmed
                height={58}
                fontSize={18}
                onClick={approveCallback}
                disabled={approval !== ApprovalState.NOT_APPROVED || isLoading}
                width="48%"
                altDisabledStyle={approval === ApprovalState.PENDING || isLoading} // show solid button while waiting
                confirmed={approval === ApprovalState.APPROVED}
              >
                {isLoading || approval === ApprovalState.PENDING ? (
                  <AutoRow fontSize={18} gap="6px" justify="center" lineHeight={2}>
                    <Loader stroke="rgba(74, 161, 202, 0.8)" /> Approving
                  </AutoRow>
                ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                  "Approved"
                ) : (
                  "Approve " + currencies[Field.INPUT]?.symbol
                )}
              </ButtonConfirmed>
              <ButtonPrimary
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap();
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    });
                  }
                }}
                width="48%"
                id="swap-button"
                disabled={
                  !isValid ||
                  approval !== ApprovalState.APPROVED ||
                  (priceImpactSeverity > 3 && !isExpertMode)
                }
              >
                <Text fontSize={18} fontWeight={500}>
                  {priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact High`
                    : `Swap${priceImpactSeverity > 2 ? " Anyway" : ""}`}
                </Text>
              </ButtonPrimary>
            </RowBetween>
          ) : (
            <ButtonPrimary
              onClick={() => {
                if (isExpertMode) {
                  handleSwap();
                } else {
                  setSwapState({
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                  });
                }
              }}
              id="swap-button"
              disabled={
                !isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError
              }
            >
              <Text fontSize={20} fontWeight={500}>
                {swapInputError
                  ? swapInputError
                  : priceImpactSeverity > 3
                    ? `Price Impact Too High`
                    : `Swap${priceImpactSeverity > 2 ? " Anyway" : ""}`}
              </Text>
            </ButtonPrimary>
          )}
        </BottomGrouping>

        {/* 一些警告信息  */}
        {priceImpactSeverity > 2 && (
          <SwapWraning
            title={`${"HIGH PRICE IMPACT"}`}
            desc="Trading this volume of chosen tokens will result in a major price impact and diminish your returns."
          />
        )}
        {showWrap ? null : (
          <AutoColumn gap="4px">
            {Boolean(trade) && (
              <RowBetween align="center" style={{ marginTop: 25, padding: "0 20px" }}>
                <Text fontWeight={500} fontSize={14} color={theme.white}>
                  <TradePrice
                    price={trade?.executionPrice}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                  />
                </Text>
                <Text fontSize={14} fontWeight={500} color={theme.white}>
                  Slippage Tolerance: {allowedSlippage / 100}%
                </Text>
              </RowBetween>
            )}
          </AutoColumn>
        )}
      </AppBody>
      <AdvancedSwapDetailsDropdown trade={trade} />
    </>
  );
}
