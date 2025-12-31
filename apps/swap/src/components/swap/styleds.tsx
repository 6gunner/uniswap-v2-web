import { transparentize } from "polished";
import { AlertTriangle } from "react-feather";
import styled, { css } from "styled-components";
import { Text } from "rebass";
import { AutoColumn } from "../Column";

export const Wrapper = styled.div`
  position: relative;
`;

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  padding: 0px;
  position: absolute;
  width: 36px;
  height: 36px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 20;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            opacity: 0.8;
          }
        `
      : null}
`;

export const SplitLine = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
`;

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.borderColor};
`;

export const BottomGrouping = styled.div`
  margin-top: 1rem;
`;

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.errorRed
      : severity === 2
        ? theme.yellow2
        : severity === 1
          ? theme.text1
          : theme.green1};
`;

export const StyledBalanceMaxMini = styled.button`
  height: 22px;
  width: 22px;
  background-color: ${({ theme }) => theme.bg4};
  border: none;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.white};
  display: flex;
  justify-content: center;
  align-items: center;
  float: right;

  :hover {
    background-color: ${({ theme }) => theme.bg3};
  }
  :not(:hover) {
    background-color: ${({ theme }) => theme.bg4};
  }
`;

export const TruncatedText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  text-overflow: ellipsis;
  width: 146px;
  overflow: hidden;
`;

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: ".";
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: ".";
    }
    33% {
      content: "..";
    }
    66% {
      content: "...";
    }
  }
`;

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => theme.primary3};
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 18px 20px;
  margin-top: 24px;
  z-index: -1;
  .title {
    color: ${({ theme }) => theme.errorRed};
    padding: 0;
    margin: 0;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 16px;
  }
  .desc {
    color: ${({ theme }) => transparentize(0.3, theme.errorRed)};
    text-align: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    margin: 0;
  }
`;

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.errorRed)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`;

export function SwapCallbackError({ error }: { error: string }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p>{error}</p>
    </SwapCallbackErrorInner>
  );
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.9, theme.primary3)};
  color: ${({ theme }) => theme.primary3};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`;

export const ShdowBox = styled.div`
  position: relative;
  max-width: 456px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 16px;
`;

export const SvgIconBox = styled.div<{ size: number }>`
  width: ${({ size }) => size + "px"};
  height: ${({ size }) => size + "px"};
  background: #f2f4f7;
  border: 1px solid rgba(14, 17, 27, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  :hover {
    background: #f6f7f9;
  }
`;

export function SwapWraning({ title, desc }: { title: string; desc: string }) {
  return (
    <SwapCallbackErrorInner>
      <p className="title">{title}</p>
      <p className="desc">{desc}</p>
    </SwapCallbackErrorInner>
  );
}
