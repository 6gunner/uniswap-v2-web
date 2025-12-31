import React, { useEffect, useRef } from "react";

import styled from "styled-components";

import { useActiveWeb3React } from "../../hooks";

const StyledIdenticonContainer = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.bg4};
`;

export default function Identicon() {
  const ref = useRef<HTMLDivElement>();

  const { account } = useActiveWeb3React();

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = "";
    }
  }, [account]);

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return <StyledIdenticonContainer ref={ref as any} />;
}
