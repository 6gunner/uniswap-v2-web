import { useState } from "react";
import styled from "styled-components";
import { ButtonPrimary } from "../../components/Button";
import { SvgIcon } from "../../components/SvgIcon";
import { Link } from "react-router-dom";
import PairList from "../../components/PairList";
import PositionList from "../../components/PositionList";
import Row, { AutoRow } from "../../components/Row";
import { useWeb3React } from "@web3-react/core";
import { Tabs } from "antd";
import { transparentize } from "polished";

const TabItem = styled.div<{ active: boolean }>`
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  font-size: 20px;
  height: 38px;
  cursor: pointer;
  font-weight: 500;
  color: ${({ active, theme }) => {
    return `${active ? theme.primary3 : transparentize(0.4, theme.primary3)}`;
  }};
`;
const TableBox = styled.div<{ visible: boolean }>`
  border-radius: 16px;
  background: #fff;
  display: ${({ visible }) => {
    return `${visible ? "block" : "none"};`;
  }};
`;

const Box = styled.div`
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;
  padding-inline: 24px;
`;
const PoolPage = () => {
  const [tabActive, setTabActive] = useState<boolean>(true);
  const { account } = useWeb3React();

  return (
    <Box>
      <Row
        style={{
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <AutoRow gap="12px">
          <TabItem
            active={tabActive}
            onClick={() => {
              setTabActive(true);
            }}
          >
            Pool
          </TabItem>
          <TabItem
            active={!tabActive}
            onClick={() => {
              setTabActive(false);
            }}
          >
            My Position
          </TabItem>
        </AutoRow>
        <ButtonPrimary
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            padding: "0 10px",
            height: "44px",
            width: "fit-content",
            borderRadius: "14px",
          }}
          as={Link}
          to="/create/eth"
        >
          <SvgIcon style={{ width: 24, height: 24, marginRight: 6 }} name={"add"} />
          New position
        </ButtonPrimary>
      </Row>

      <TableBox visible={tabActive}>
        <PairList />
      </TableBox>
      <TableBox visible={!tabActive}>
        <PositionList />
      </TableBox>
    </Box>
  );
};

export default PoolPage;
