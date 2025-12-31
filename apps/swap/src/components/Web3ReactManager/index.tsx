import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ReactNode } from "react";
import useEagerlyConnect from "../../hooks";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Flex, Spin } from "antd";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@src/state";
import { updatePositions } from "@src/state/user/actions";

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
`;
const StyledSpin = styled(Spin)`
  &.ant-spin .ant-spin-dot-holder {
    color: ${({ theme }) => theme.primaryText1};
  }
`;
const Message = styled.h2`
  color: ${({ theme }) => theme.secondary1};
`;

function useInactiveListener(suppress = false) {
  const { account, connector } = useWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  const handleConnect = useCallback(() => {
    console.log("Handling 'connect' event");
    connector.activate();
  }, [connector]);

  const handleChainChanged = useCallback(
    (chainId: string | number) => {
      // console.log("Handling 'chainChanged' event with payload", chainId);
      console.log("[Debug] Chain changed:", chainId);
      connector.activate();
    },
    [connector]
  );

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      console.log("Handling 'accountsChanged' event with payload", accounts);
      if (accounts.length > 0) {
        connector.activate();
        if (account != accounts[0]) {
          dispatch(updatePositions({ positions: [] })); // 清空 positions
        }
      }
    },
    [connector, account, dispatch]
  );

  const handleNetworkChanged = useCallback(
    (networkId: string | number) => {
      console.log("Handling 'networkChanged' event with payload", networkId);
      connector.activate();
    },
    [connector]
  );
  useEffect(() => {
    if (suppress || !connector?.provider?.on) return;

    connector.provider.on("connect", handleConnect);
    connector.provider.on("chainChanged", handleChainChanged);
    connector.provider.on("accountsChanged", handleAccountsChanged);
    connector.provider.on("networkChanged", handleNetworkChanged);

    return () => {
      if (connector.provider?.removeListener) {
        connector.provider.removeListener("connect", handleConnect);
        connector.provider.removeListener("chainChanged", handleChainChanged);
        connector.provider.removeListener("accountsChanged", handleAccountsChanged);
        connector.provider.removeListener("networkChanged", handleNetworkChanged);
      }
    };
  }, [
    suppress,
    connector,
    handleConnect,
    handleChainChanged,
    handleAccountsChanged,
    handleNetworkChanged,
  ]);
}

export default function Web3ReactManager({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { isActive, isActivating, connector } = useWeb3React();
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [showLoader, setShowLoader] = useState(false);

  const triedEager = useEagerlyConnect();

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // 在尝试自动连接前不显示任何内容
  if (!triedEager) {
    return null;
  }

  // 如果有错误，显示错误信息
  if (!isActive && connectionError) {
    return (
      <MessageWrapper>
        <Message>{t("unknownError")}</Message>
      </MessageWrapper>
    );
  }

  // 如果正在连接中，显示加载动画
  // if (isActivating) {
  //   return showLoader ? (
  //     <Flex align="center" justify="center" style={{ height: "80vh" }}>
  //       <StyledSpin size="large" />
  //     </Flex>
  //   ) : null;
  // }

  return children;
}
