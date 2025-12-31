import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { transparentize } from "polished";
const HeaderMenuWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;
const MenuItem = styled(Link)`
  padding: 8px 9px;
  // padding-block: 8px;
  color: ${({ theme }) => transparentize(0.4, theme.primary3)};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;

  &.active {
    color: ${({ theme }) => theme.primary3};
  }

  &:hover {
    color: ${({ theme }) => theme.primary3};
  }
`;
const HeaderMenu = () => {
  const { pathname } = useLocation();
  return (
    <HeaderMenuWrap>
      <MenuItem to="/swap" className={pathname === "/swap" ? "active" : ""}>
        Swap
      </MenuItem>
      <MenuItem
        to="/pool"
        className={
          pathname === "/pool" ||
          pathname.startsWith("/create") ||
          pathname.startsWith("/add") ||
          pathname.startsWith("/remove")
            ? "active"
            : ""
        }
      >
        Pool
      </MenuItem>
    </HeaderMenuWrap>
  );
};
export default HeaderMenu;
