import styled from "styled-components";
import { darken, transparentize } from "polished";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useHistory } from "react-router";

const Tabs = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-radius: 14px;
  background: ${({ theme }) => transparentize(0.7, theme.white)};
  width: 100%;
  height: 56px;
  padding: 2px;
`;

const activeClassName = "ACTIVE";

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.white};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.white)};
  }
`;

const TabsText = styled.div`
  font-weight: 500;
  font-size: 18px;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(0, 0, 0, 0.5);
  width: 50%;
  height: 100%;
  cursor: pointer;
  &.active {
    background: #fff;
    color: ${({ theme }) => theme.text1};
  }
`;

export function LiquidityTabs({ adding }: { adding: boolean }) {
  const { pathname } = useLocation();
  const history = useHistory();

  const switchRoute = (adding: boolean) => {
    if (adding) {
      const netPath = pathname.replace("/remove", "/add");
      history.replace(netPath);
    } else {
      const netPath = pathname.replace("/add", "/remove");
      history.replace(netPath);
    }
  };
  return (
    <Tabs>
      <TabsText className={clsx({ active: adding })} onClick={() => switchRoute(true)}>
        Add Liquidity
      </TabsText>
      <TabsText className={clsx({ active: !adding })} onClick={() => switchRoute(false)}>
        Remove Liquidity
      </TabsText>
    </Tabs>
  );
}
