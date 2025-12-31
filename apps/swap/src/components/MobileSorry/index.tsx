import styled, { ThemeContext } from "styled-components";
import { ButtonPrimary } from "../Button";
import { SvgIcon } from "../SvgIcon";
// import mobileLogo from "../../assets/images/mobileLogo.png";
import { Flex } from "antd";
import { useContext } from "react";
import { Logo } from "@repo/ui";

// const MobileLogo = styled.img`
//   width: 128px;
//   height: 128px;
// `;

const MobileTitle = styled.span`
  color: ${({ theme }) => theme.white};
  text-align: center;
  font-family: Comfortaa;
  font-size: 36px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 36px */
`;

const MobileText = styled.span`
  color: ${({ theme }) => theme.white};
  text-align: center;
  font-family: Comfortaa;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; /* 32px */
`;

const MobileFooter = styled.div`
  color: ${({ theme }) => theme.white};
  text-align: center;
  font-family: Comfortaa;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; /* 25.6px */
`;

const FlexBox = styled(Flex)`
  padding: 80px 17px 36px;
  display: none;
  @media (max-width: 819px) {
    display: flex;
  }
`;

const Space = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
`;
const MobileSorry = () => {
  const theme = useContext(ThemeContext);
  return (
    <FlexBox vertical align="center">
      {/* <MobileLogo src={mobileLogo} /> */}
      <Logo height={128} width={128} />
      <MobileTitle>coming soon</MobileTitle>
      <Space size={35} />
      <MobileText>
        Sugar is best served on desktop right now while we refine the mobile experience.
      </MobileText>
      <Space size={32} />
      <ButtonPrimary onClick={() => window.open("https://sugar.finance", "_self")} width={"180px"}>
        Back Home
      </ButtonPrimary>
      <Space size={99} />
      <SvgIcon
        onClick={() => window.open("", "_self")}
        name={"tuite"}
        size={28}
        style={{ color: theme.white }}
      />
      <Space size={35} />
      <MobileFooter>© 2024 Sugar Finance</MobileFooter>
    </FlexBox>
  );
};

export default MobileSorry;
