import { Flex } from "antd";
import { Link } from "react-router-dom";
import { StyledArrowLeft } from "../../pages/Pool/styleds";
import { Text } from "rebass";
import styled from "styled-components";

const CFlex = styled(Flex)`
  position: absolute;
  left: 24px;
  :hover {
    opacity: 0.5;
  }
`;
const BackArrow = styled(StyledArrowLeft)`
  width: 20px;
`;
const GText = styled(Text)`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.white};
`;
export const AddRemoveGoback = () => (
  <Link to="/pool">
    <CFlex align="center" gap={4}>
      <BackArrow style={{ width: 20 }} />
      <GText>Back</GText>
    </CFlex>
  </Link>
);
