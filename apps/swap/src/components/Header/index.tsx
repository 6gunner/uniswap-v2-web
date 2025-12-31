import { ChainId } from "@repo/sugar-finance-sdk";

import styled from "styled-components";

import { useDarkModeManager } from "../../state/user/hooks";

import { OutlineCard } from "../Card";
import Row, { RowBetween, RowFixed } from "../Row";
import Web3Status from "../Web3Status";
import HeaderMenu from "./HeaderMenu";
import { useWeb3React } from "@web3-react/core";
import { NETWORK_CHAIN_ID } from "@src/connectors";
import { useCallback } from "react";
import { getAddChainParameters, NETWORK_LABELS } from "@src/utils/chain";
import { HelpCircle } from "react-feather";
import { SvgIcon } from "../SvgIcon";
// import Logo from "@src/assets/svg/wordmark.png";
// import LottieLogo from "../LottieLogo";
// import HeaderLogo from "../HeaderLogo";
import { Logo } from "@repo/ui";
const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 112px;
  padding: 12px 24px;
  top: 0;
  position: fixed;
  background-color: ${({ theme }) => theme.primaryText1};
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 12px 0 0 0;
    width: calc(100%);
    position: relative;
  `};
`;
const ChainLogo = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;
const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  position: absolute;
  top: 50%;
  left: calc(50% - 48px);
  transform: translateY(-50%);
  :hover {
    cursor: pointer;
  }
`;

// const TitleText = styled(Row)`
//   width: fit-content;
//   white-space: nowrap;
//   position: relative;
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     display: none;
//   `};
//   .logo,
//   .textlogo {
//     position: absolute;
//     transition: opacity 0.2s ease-in-out;
//   }

//   .logo {
//     opacity: 1;
//     width: 88px;
//     height: 88px;
//   }

//   .textlogo {
//     width: 100px;
//     height: 100px;
//     opacity: 0;
//   }

//   &:hover {
//     .logo {
//       opacity: 0;
//     }
//     .textlogo {
//       opacity: 1;
//     }
//   }
// `;

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  // background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  :focus {
    border: 1px solid blue;
  }
`;

const NetworkCard = styled(OutlineCard)`
  width: auto;
  cursor: pointer;
  height: 40px;
  font-weight: 400;
  font-size: 16px;
  display: flex;
  font-family: Comfortaa;
  align-items: center;
  justify-content: flex-start;
  margin-right: 16px;
  border-radius: 12px;
  padding: 12px 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

const CustomHelpCircle = styled(HelpCircle)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  color: #ff4281;
`;

export default function Header() {
  const { account, chainId, connector } = useWeb3React();
  const [isDark] = useDarkModeManager();

  const switchChain = useCallback(
    async (desiredChainId: number) => {
      try {
        await connector.activate(getAddChainParameters(desiredChainId));
      } catch (error) {
        console.error(error);
      }
    },
    [connector, chainId]
  );

  const changeToRightNetwork = async () => {
    if (chainId != NETWORK_CHAIN_ID) {
      await switchChain(NETWORK_CHAIN_ID);
    }
  };

  const renderNetworkInfo = () => {
    if (chainId) {
      if (chainId !== NETWORK_CHAIN_ID) {
        return (
          <NetworkCard onClick={changeToRightNetwork}>
            <CustomHelpCircle color={"#fff"} />
            Wrong Network
          </NetworkCard>
        );
      } else {
        return (
          <NetworkCard>
            <ChainLogo src={`${import.meta.env.VITE_STATIC_URL}/ETH.png`} alt="ETH Sepolia" />
            &nbsp;
            {NETWORK_LABELS[chainId as ChainId]}
          </NetworkCard>
        );
      }
    }
  };

  return (
    <HeaderFrame>
      <RowBetween style={{ alignItems: "flex-start" }}>
        <HeaderMenu />
        <HeaderElement>
          <Title href=".">
            <Logo height={88} width={88} />
            {/* <TitleText>
              <HeaderLogo className="logo" />
              <LottieLogo className="textlogo" />
            </TitleText> */}
          </Title>
        </HeaderElement>
        <HeaderElement>
          {renderNetworkInfo()}
          <AccountElement active={!!account} style={{ pointerEvents: "auto" }}>
            <Web3Status />
          </AccountElement>
        </HeaderElement>
      </RowBetween>
    </HeaderFrame>
  );
}
