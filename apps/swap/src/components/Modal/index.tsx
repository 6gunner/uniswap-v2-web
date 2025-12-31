import React from "react";
import styled, { css } from "styled-components";
import { animated, useSpring } from "react-spring";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { isMobile } from "react-device-detect";
import "@reach/dialog/styles.css";
import { transparentize } from "polished";
import { useGesture } from "@use-gesture/react";

const AnimatedDialogOverlay = animated(DialogOverlay);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    background-color: ${({ theme }) => theme.modalBG};
  }
`;

const AnimatedDialogContent = animated(DialogContent);
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, width, mobile, isOpen, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  "aria-label": "dialog",
})`
  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    // border: 1px solid ${({ theme }) => theme.bg1};
    background-color: ${({ theme }) => theme.bg1};
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
    padding: 0px;
    min-width: 440px;
    ${({ width }) =>
      width
        ? css`
            width: ${width}px;
          `
        : "50vw"}
    overflow: hidden;
    max-width: 456px;
    align-self: ${({ mobile }) => (mobile ? "flex-end" : "center")};

    ${({ maxHeight }) =>
      maxHeight &&
      css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
      minHeight &&
      css`
        min-height: ${minHeight}vh;
      `}
    display: flex;
    border-radius: 20px;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  minHeight?: number | false;
  width?: number | false;
  maxHeight?: number;
  initialFocusRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  width = false,
  maxHeight = 50,
  initialFocusRef,
  children,
}: ModalProps) {
  const [{ y }, set] = useSpring(() => ({
    y: 0,
    config: { mass: 1, tension: 210, friction: 20 },
  }));
  const bind = useGesture({
    onDrag: (state) => {
      set({
        y: state.down ? state.movement[1] : 0,
      });
      if (state.movement[1] > 300 || (state.velocity[1] > 3 && state.direction[1] > 0)) {
        onDismiss();
      }
    },
  });

  return (
    <>
      {isOpen && (
        <StyledDialogOverlay initialFocusRef={initialFocusRef}>
          <StyledDialogContent
            {...(isMobile
              ? {
                  ...bind(),
                  style: {
                    transform: y.interpolate((y) => `translateY(${y > 0 ? y : 0}px)`),
                  },
                }
              : {})}
            aria-label="dialog content"
            minHeight={minHeight}
            width={width}
            maxHeight={maxHeight}
            mobile={isMobile}
          >
            {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
            {children}
          </StyledDialogContent>
        </StyledDialogOverlay>
      )}
    </>
  );
}
