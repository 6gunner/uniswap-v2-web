import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import styled, { keyframes } from "styled-components";
import sugarLogo from "../../assets/images/sugarLogo.png";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;
const HeaderLogoBox = styled.div`
  position: relative;
  .star {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 10px;
    left: -5px;
  }
`;
const SugarLogo = styled.img`
  width: 100%;
  height: 100%;
`;
const HeaderLogo = ({ className }: { className: string }) => {
  return (
    <HeaderLogoBox className={className}>
      <DotLottieReact autoplay loop className="star" src="/logo.json" />
      <SugarLogo src={sugarLogo} alt="logo" />
    </HeaderLogoBox>
  );
};

export default HeaderLogo;
