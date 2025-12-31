import { Flex, Skeleton, Spin } from "antd";
import styled from "styled-components";

const Wrapper = styled.div`
  height: 512px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSkeleton = styled(Skeleton)`
  padding: 1rem 1.125rem;
`;

const StyledSpin = styled(Spin)`
  &.ant-spin .ant-spin-dot-holder {
    color: ${({ theme }) => theme.primaryText1};
  }
`;

function ListSkeleton() {
  return (
    <Wrapper>
      <Flex gap={16} vertical>
        <StyledSpin size="large" />
        Loading
      </Flex>
    </Wrapper>
  );
}

export default ListSkeleton;
