import { transparentize } from "polished";
import styled from "styled-components";
import { ButtonError, ButtonPrimary } from "../Button";

const ModalButton = styled(ButtonError)`
  margin: 10px 0 0 0;
  background: ${({ theme }) => theme.primaryText1} !important;
  color: ${({ theme }) => theme.white};
  :hover {
    background: ${({ theme }) => transparentize(0.2, theme.primaryText1)} !important;
  }
`;

const ModalButtonPrimary = styled(ButtonPrimary)`
  background-color: ${({ theme }) => theme.primaryText1} !important;
  color: ${({ theme }) => theme.white};
  :hover {
    background-color: ${({ theme }) => transparentize(0.2, theme.primaryText1)} !important;
  }
`;

export { ModalButton, ModalButtonPrimary };
