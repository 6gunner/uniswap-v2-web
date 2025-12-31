import styled from "styled-components";
import { isMobile } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import { useWalletModalOpen, useWalletModalToggle } from "../../state/application/hooks";

import Modal from "../Modal";
import Option from "./Option";
import { ExternalLink } from "../../theme";
import { SvgIcon } from "../SvgIcon";
import Logo from "@src/assets/images/logoText.svg";

import { useSyncExternalStore } from "react";
import { createStore } from "mipd";
import { getConnections } from "../../connectors";

const store = createStore();

const CloseIcon = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  &:hover {
    cursor: pointer;
  }
`;

const SvgIconStyle = styled(SvgIcon)`
  color: rgba(0, 0, 0, 0.5) !important;
  cursor: pointer;
  &:hover {
    color: rgba(0, 0, 0) !important;
  }
`;

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`;

const HeaderRow = styled.div`
  color: #000;
  font-family: Comfortaa;
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  color: ${({ theme }) => theme.text1};
  margin: 0px auto 36px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  svg {
    width: 120px;
    height: 80px;
  }
`;

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 32px 36px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`;

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const Blurb = styled.div`
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
  margin-top: 24px;
  text-align: center;
  a {
    color: rgb(0, 0, 0);
    text-decoration: underline;
  }
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
    justify-items: center;
  `};
`;

const connections = getConnections();

export default function WalletModal() {
  const walletModalOpen = useWalletModalOpen();
  const toggleWalletModal = useWalletModalToggle();

  // close modal when a connection is successful
  const providers = useSyncExternalStore(store.subscribe, store.getProviders);

  /**
   * 获取用户可以连接的钱包
     get wallets user can switch too, depending on device/browser
   * @returns 
   */
  function getOptions() {
    const rdnsArray = providers.map((provider: { info: { rdns: any } }) => provider.info.rdns);
    return connections.map((option) => {
      // check for mobile options
      if (isMobile) {
        if (option.mobile) {
          return (
            <Option
              id={option.key}
              key={option.key}
              color={option.color}
              link={option.installLink}
              header={option.name}
              subheader={null}
              icon={`/assets/images/wallet/${option.iconName}`}
              installed={rdnsArray.includes(option.rdns)}
              connector={option.connector}
            />
          );
        }
        return null;
      }
      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={option.key}
            key={option.key}
            color={option.color}
            link={option.installLink}
            connector={option.connector}
            header={option.name}
            subheader={null}
            icon={`/assets/images/wallet/${option.iconName}`}
            installed={rdnsArray.includes(option.rdns)}
          />
        )
      );
    });
  }

  function getModalContent() {
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <SvgIconStyle name="x" size={24} />
        </CloseIcon>
        <ContentWrapper>
          <HeaderRow>
            <Logo />
            <span>Connect Wallet</span>
          </HeaderRow>

          <OptionGrid>{getOptions()}</OptionGrid>
          <Blurb>
            <span>
              Agree to be bound by the&nbsp;
              <ExternalLink href="#">Terms of Use.</ExternalLink>
            </span>
          </Blurb>
        </ContentWrapper>
      </UpperSection>
    );
  }

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={toggleWalletModal}
      minHeight={false}
      maxHeight={90}
      width={416}
    >
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  );
}
