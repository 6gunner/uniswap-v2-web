import styled from "styled-components";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";
import { Text } from "rebass";

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`;

export const ModalTitle = styled(Text)`
  font-weight: 500;
  font-size: 20px;
  font-family: Comfortaa;
  color: ${({ theme }) => theme.text1};
`;

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary3};
  font-size: 14px;
`;

export const PaddedColumn = styled(AutoColumn)`
  padding: 28px 20px 20px;
`;

export const MenuItem = styled(RowBetween)`
  padding: 13px 10px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 10px;
  cursor: ${({ disabled }) => !disabled && "pointer"};
  pointer-events: ${({ disabled }) => disabled && "none"};
  :hover {
    // background-color: ${({ theme, disabled }) => !disabled && theme.bg2};
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
  }
  // opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`;
export const SearchBox = styled.div`
  position: relative;
`;
export const SearchInput = styled.input.attrs(() => ({
  autocomplete: "off",
}))`
  position: relative;
  display: flex;
  padding: 18px 18px 18px 40px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.text1};
  border-style: solid;
  border: 1px solid #D9D9D9;
  -webkit-appearance: none;

  font-size: 16px;

  ::placeholder {
    // color: ${({ theme }) => theme.text3};
    color: rgba(0, 0, 0, 0.5)
    font-size: 16px;
  }
  transition: border 100ms;
  :focus {
    // border: 1px solid ${({ theme }) => theme.primary3};
    outline: none;
  }
`;
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg2};
`;

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`;

export const CustomEmpty = styled.div`
  width: 100%;
  position: absolute;
  top: 207px;
  left: 0px;
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  font-family: Comfortaa;
  display: flex;
  flex-direction: column;
  align-items: center;
  juastify-content: center;
  img {
    width: 120px;
    height: 120px;
  }
  span {
    color: rgba(0, 0, 0, 0.6);
    font-size: 16px;
    font-weight: 400;
    font-family: Comfortaa;
  }
`;
