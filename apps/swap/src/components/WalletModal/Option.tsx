import React, { useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { ConnectionType } from "@src/connectors";
import { updateSelectedWallet } from "@src/state/user/actions";
import { Connector } from "@web3-react/types";
import { useSelectedWallet } from "@src/state/user/hooks";
import { useDispatch } from "react-redux";
import Loader from "../Loader";
import { useWalletModalToggle } from "@src/state/application/hooks";

const InfoCard = styled.button<{ active?: boolean }>`
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 500px;
  width: 368px !important;
  border-color: transparent;
`;

const OptionCard = styled(InfoCard as any)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 14px;
`;

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`;

const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
  margin-top: 0;
  background: rgba(0, 0, 0, 0.03);
  cursor: ${({ clickable }) => (clickable ? "pointer" : "not-allowed")};
  opacity: ${({ disabled }) => (disabled ? "0.5" : "1")};
`;

const WalletNameText = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  font-weight: 500;
`;

const SubHeader = styled.div`
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
  font-size: 12px;
`;

const IconWrapper = styled.div<{ size?: number | null }>`
  align-items: center;
  justify-content: center;
  height: ${({ size }) => (size ? size + "px" : "36px")};
  & > img {
    border-radius: 50%;
    height: ${({ size }) => (size ? size + "px" : "36px")};
    width: ${({ size }) => (size ? size + "px" : "36px")};
  }
  margin-right: 12px;
`;

// 右边的installed tag
const TagWrapper = styled.div`
  color: ${({ theme }) => theme.primaryText1};
  background: rgba(74, 161, 202, 0.2);
  text-align: right;
  padding: 5px 8px;
  border-radius: 500px;
  font-family: Comfortaa;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 100%;
`;

const TagDelWrapper = styled(TagWrapper)`
  color: rgba(0, 0, 0, 0.5);
  background: transparent;
`;

export default function Option({
  link,
  clickable = true,
  size,
  header,
  subheader = null,
  icon,
  active = false,
  id,
  installed = false,
  connector,
}: {
  link: string;
  clickable?: boolean;
  size?: number | null;
  color: string;
  header: React.ReactNode;
  subheader: React.ReactNode | null;
  icon: string;
  active?: boolean;
  id: string;
  installed: boolean;
  connector: Connector;
}) {
  const { selectedWallet } = useSelectedWallet();
  const dispatch = useDispatch();
  const [pendingWallet, togglePending] = useState(false);
  const [pendingError, setPendingError] = useState<boolean>();
  const toggleWalletModal = useWalletModalToggle();
  const theme = useContext(ThemeContext);
  const tryActivation = async () => {
    togglePending(true); // set wallet for pending view
    try {
      // 1. 先断开当前连接
      if (connector) {
        if (connector.deactivate) {
          await connector.deactivate();
        }
        // 确保重置状态
        await connector.resetState();
        // 3. 再连接新的钱包
        await connector.activate();
        dispatch(updateSelectedWallet({ wallet: id as ConnectionType }));
        toggleWalletModal();
      }
    } catch (error) {
      console.error(error);
      setPendingError(true);
    } finally {
      togglePending(false);
    }
  };

  const handleClick = () => {
    if (!installed) {
      window.open(link, "_blank");
      return;
    }
    tryActivation();
  };

  const lastClicked = selectedWallet === id;

  return (
    <OptionCardClickable
      id={id}
      onClick={handleClick}
      clickable={clickable && !active}
      active={active}
    >
      <OptionCardLeft>
        <WalletNameText>
          <IconWrapper size={size}>
            <img src={icon} alt={"Icon"} />
          </IconWrapper>
          <span>{header}</span>
        </WalletNameText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      {pendingWallet ? (
        <Loader stroke={theme.primaryText1} />
      ) : (
        <>
          {lastClicked ? (
            <TagWrapper>Recent</TagWrapper>
          ) : (
            installed && <TagDelWrapper>Detected</TagDelWrapper>
          )}
        </>
      )}
    </OptionCardClickable>
  );
}
