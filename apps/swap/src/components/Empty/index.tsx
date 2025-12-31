import styled from "styled-components";
import { SvgIcon } from "../SvgIcon";

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 12px;
  p {
    margin: 0px;
    color: #000;
    text-align: center;
    font-family: Comfortaa;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
  }
`;

export const NoDataWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 512px;
  font-size: 16px;
`;
const Empty = ({ imgName, text }: { imgName: string; text: string }) => {
  return (
    <EmptyWrapper>
      <SvgIcon size={120} name={imgName} />
      <p>{text}</p>
    </EmptyWrapper>
  );
};

export default Empty;
