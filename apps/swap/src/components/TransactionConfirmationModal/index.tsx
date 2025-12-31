import { ChainId } from "@repo/sugar-finance-sdk";
import { ReactNode, useContext, useEffect } from "react";
import styled, { ThemeContext } from "styled-components";
import Modal from "../Modal";
import { ExternalLink, theme } from "../../theme";
import { Text } from "rebass";
import { CloseIcon, Spinner } from "../../theme/components";
import { RowBetween } from "../Row";
import { AlertTriangle, CheckCircle } from "react-feather";
import { ButtonLight, ButtonPrimary } from "../Button";
import { AutoColumn, ColumnCenter } from "../Column";
import Circle from "../../assets/images/blue-loader.svg?url";

import { getEtherscanLink } from "../../utils";
import { useActiveWeb3React } from "../../hooks";
import { Flex } from "antd";
import { SvgIcon } from "../SvgIcon";
import { ModalButtonPrimary } from "../ModalButton";

const Wrapper = styled.div`
  width: 100%;
`;
const Section = styled(AutoColumn)`
  padding: 24px;
`;

const BottomSection = styled(Section)`
  background-color: ${({ theme }) => theme.bg4};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`;

const CustomLightSpinner = styled(Spinner)<{ size: string }>`
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`;

const LineButton = styled.div`
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  background: #fff;
  color: #000;
  width: 172px;
  height: 52px
  line-height: 50px;
  text-align: center;
  font-family: Comfortaa;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  cursor: pointer;
  :hover {
      border: 1px solid ${({ theme }) => theme.text1};
  }
`;

const Gap = styled.div<{ height: number }>`
  height: ${(props) => props.height}px;
`;

function ConfirmationPendingContent({
  onDismiss,
  pendingText,
}: {
  onDismiss: () => void;
  pendingText: string;
}) {
  const theme = useContext(ThemeContext);
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <CustomLightSpinner src={Circle} alt="loader" size={"90px"} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={"center"}>
          <Text fontWeight={500} fontSize={20} color={theme.text1}>
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={"center"}>
            <Text fontWeight={600} fontSize={14} color={theme.text2} textAlign="center">
              {pendingText}
            </Text>
          </AutoColumn>
          <Text fontSize={12} color="#565A69" textAlign="center">
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </Section>
    </Wrapper>
  );
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  transactionText,
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
  transactionText?: string;
}) {
  const theme = useContext(ThemeContext);

  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn justify="center">
          <SvgIcon name="circle_check_pro" size={88} style={{ color: "#fff" }} />
          <Gap height={28} />
          <Text color={theme.text1} fontWeight={500} fontSize={20}>
            Transaction Submitted
          </Text>
          <Gap height={16} />
          {transactionText && (
            <Text textAlign={"center"} fontSize={16} color={"rgba(0, 0, 0, 0.5)"}>
              {transactionText}
            </Text>
          )}
        </AutoColumn>
        <Gap height={47} />
        <Flex align="center" justify="center" gap={16}>
          {chainId && hash && (
            <LineButton
              // eslint-disable-next-line no-undef
              onClick={() => window.open(getEtherscanLink(chainId, hash, "transaction"), "_target")}
            >
              View on Explorer
            </LineButton>
          )}
          <ModalButtonPrimary
            height={52}
            borderRadius="16px"
            onClick={onDismiss}
            style={{ width: 172, background: theme.primaryText1 }}
          >
            <Text fontWeight={500} fontSize={20} color={theme.white}>
              Close
            </Text>
          </ModalButtonPrimary>
        </Flex>
      </Section>
    </Wrapper>
  );
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: {
  title: string;
  onDismiss: () => void;
  topContent: () => ReactNode;
  bottomContent: () => ReactNode;
}) {
  const theme = useContext(ThemeContext);
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20} color={theme.text1}>
            {title}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section>
      <BottomSection gap="12px">{bottomContent()}</BottomSection>
    </Wrapper>
  );
}

export function TransactionErrorContent({
  message,
  onDismiss,
  errorHidden,
}: {
  message: string;
  onDismiss: () => void;
  errorHidden?: boolean;
}) {
  const theme = useContext(ThemeContext);
  useEffect(() => {
    errorHidden && onDismiss();
  }, [errorHidden]);
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            Error
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: "2rem 0" }} gap="24px" justify="center">
          <AlertTriangle color={"#FF4281"} style={{ strokeWidth: 1.5 }} size={64} />
          <Text
            fontWeight={500}
            fontSize={16}
            color={"#FF4281"}
            style={{ textAlign: "center", width: "85%", textWrap: "wrap" }}
          >
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash: string | undefined;
  content: () => ReactNode;
  attemptingTxn: boolean;
  pendingText: string;
  transactionText?: string;
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  transactionText,
  content,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React();

  if (!chainId) return null;

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          transactionText={transactionText}
        />
      ) : (
        content()
      )}
    </Modal>
  );
}
