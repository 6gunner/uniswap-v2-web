import React, { useState } from "react";
import styled, { DefaultTheme } from "styled-components";
import Tooltip from "./Tooltip";

const TextWrapper = styled.div<{
  margin: boolean;
  link: boolean;
  fontSize: string;
  adjustSize: boolean;
}>`
  position: relative;
  margin-left: ${(margin) => margin && "4px"};
  color: ${({ theme, link }) => (link ? theme.link : theme.white)};
  font-size: ${({ fontSize }) => fontSize || "inherit"};

  :hover {
    cursor: pointer;
  }

  @media screen and (max-width: 600px) {
    font-size: ${({ adjustSize }: { adjustSize: boolean }) => adjustSize && "12px"};
  }
`;

const FormattedName = ({
  text = "",
  maxCharacters = 0,
  margin = false,
  adjustSize = false,
  fontSize = "",
  link = false,
  ...rest
}) => {
  const [showHover, setShowHover] = useState(false);

  if (!text) {
    return "";
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <TextWrapper
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
          margin={margin}
          adjustSize={adjustSize}
          link={link}
          fontSize={fontSize}
          {...rest}
        >
          {" " + text.slice(0, maxCharacters - 1) + "..."}
        </TextWrapper>
      </Tooltip>
    );
  }

  return (
    <TextWrapper margin={margin} adjustSize={adjustSize} link={link} fontSize={fontSize} {...rest}>
      {text}
    </TextWrapper>
  );
};

export default FormattedName;
