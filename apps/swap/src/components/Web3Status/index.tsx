import { useWeb3React } from "@web3-react/core";
import { transparentize } from "polished";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled, { ThemeContext } from "styled-components";
import { Flex } from "antd";
import useENSName from "../../hooks/useENSName";
import { useWalletModalToggle } from "../../state/application/hooks";
import { isTransactionRecent, useAllTransactions } from "../../state/transactions/hooks";
import { TransactionDetails } from "../../state/transactions/reducer";
import { shortenAddress } from "../../utils";
import { ButtonSecondary } from "../Button";

import WalletModal from "../WalletModal";
import { ConnectionType } from "../../connectors";
import { useSelectedWallet } from "../../state/user/hooks";
import { useGetConnection } from "../../hooks";
import { userLogout } from "@src/state/user/actions";
import { AppDispatch } from "@src/state";
import { useDispatch } from "react-redux";
import { SvgIcon } from "../SvgIcon";

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  height: 40px;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
`;

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: ${({ theme }) => theme.white};
  border: none;
  color: ${({ theme }) => theme.primaryText1};
  font-weight: 500;
  border-radius: 12px;
  padding: 12px;
  :hover,
  :focus {
    background-color: ${({ theme }) => transparentize(0.2, theme.white)};
  }
  :not(:hover) {
    background-color: ${({ theme }) => theme.white};
  }
`;

const Web3StatusConnected = styled.div`
  border: 1px solid ${({ theme }) => theme.primary3};
  border-radius: 12px;
  padding: 0 12px;
  height: 40px;
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  color: ${({ theme }) => theme.white};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease-in-out;
  &:hover {
    .addressStyle {
      display: none;
    }
    .logoutStyle {
      display: flex;
    }
  }
  .logoutStyle {
    display: none;
  }
`;

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`;

const WalletIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const PopoverContentWrapper = styled.div`
  padding: 4px;
  font-family: Comfortaa;
  font-weight: 400;
  line-height: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #020617;
  width: 122px;
  :hover {
    color: #000;
    font-weight: 500;
  }
`;

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime;
}

function Web3StatusInner() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { account, chainId, connector } = useWeb3React();
  const { selectedWallet } = useSelectedWallet();
  const getConnection = useGetConnection();
  const theme = useContext(ThemeContext);
  const { ENSName } = useENSName(account ?? undefined);
  // const allTransactions = useAllTransactions();

  const toggleWalletModal = useWalletModalToggle();
  const connection = getConnection(selectedWallet ?? ConnectionType.METAMASK);

  const handleLogout = async () => {
    if (connector) {
      if (connector.deactivate) {
        await connector.deactivate();
      }
      // 确保重置状态
      await connector.resetState();
      dispatch(userLogout());
    }
  };

  // const popoverContent = useMemo(
  //   () => (
  //     <PopoverContentWrapper onClick={handleLogout}>
  //       <SvgIcon name="logout" size={20}></SvgIcon>
  //       Log out
  //     </PopoverContentWrapper>
  //   ),
  //   []
  // );

  // 连接成功了
  if (account) {
    return (
      // <Popover content={popoverContent} placement="bottom">
      <Web3StatusConnected id="web3-status-connected" onClick={handleLogout}>
        {/* <WalletIcon src={`/assets/images/wallet/${connection.iconName}`} /> */}
        <Flex className="addressStyle" gap={6} align="center">
          <WalletIcon src={`/assets/images/wallet/custom-avator.png`} />
          <Text>{ENSName || shortenAddress(account)}</Text>
        </Flex>
        <Flex className="logoutStyle" gap={6} align="center">
          <SvgIcon name="logout" size={24} style={{ color: theme.primary3 }} />
          <Text style={{ color: theme.primary3, width: "90.45px" }}>Disconnect</Text>
        </Flex>
      </Web3StatusConnected>
      // </Popover>
    );
    // 网络错误
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal}>
        <Text>{t("Connect Wallet")}</Text>
      </Web3StatusConnect>
    );
  }
}

export default function Web3Status() {
  const { account } = useWeb3React();

  const { ENSName } = useENSName(account ?? undefined);

  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash);
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash);

  return (
    <>
      <Web3StatusInner />
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
      />
    </>
  );
}
