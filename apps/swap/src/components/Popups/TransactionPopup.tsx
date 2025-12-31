import { CSSProperties } from "react";
// import { AlertCircle, CheckCircle } from "react-feather";
import styled from "styled-components";
import { useActiveWeb3React } from "../../hooks";
import { TYPE } from "../../theme";
import { getEtherscanLink } from "../../utils";
import { AutoColumn } from "../Column";
import { AutoRow } from "../Row";
import DoubleCurrencyLogo, { getCurrentToken } from "../DoubleLogo";
import { Currency } from "@repo/sugar-finance-sdk";
import { SvgIcon } from "../SvgIcon";
import useHttpLocations from "../../hooks/useHttpLocations";

import Logo from "../Logo";
import { ChevronRight } from "react-feather";
import { Flex } from "antd";
import CurrencyLogo from "../CurrencyLogo";
const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`;
const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: rgba(2, 6, 23, 0.5);
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.primaryText1};

  :hover {
    color: ${({ theme }) => theme.primaryText1};
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`;

const StyledListLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

const BlackFlex = styled(Flex)`
  .black-icon {
    display: none;
  }
  :hover {
    .black-icon {
      display: block;
    }
  }
`;

function ApprovedLogo({
  logoURI,
  style,
  size = "24px",
  alt,
}: {
  logoURI: string;
  size?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  const srcs: string[] = useHttpLocations(logoURI);

  return (
    <StyledListLogo alt={alt} size={size} srcs={srcs?.length ? srcs : [logoURI]} style={style} />
  );
}
export default function TransactionPopup({
  hash,
  success,
  summary,
  currency0Symbol,
  currency1Symbol,
  title,
}: {
  hash: string;
  success?: boolean;
  summary?: string;
  title?: string[];
  currency0Symbol?: string;
  currency1Symbol?: string;
}) {
  const { chainId } = useActiveWeb3React();

  // const theme = useContext(ThemeContext);

  return (
    <RowNoFlex align="center">
      {currency0Symbol && currency1Symbol ? (
        <DoubleCurrencyLogo
          size={26}
          currency0={{ symbol: currency0Symbol } as Currency}
          currency1={{ symbol: currency1Symbol } as Currency}
        />
      ) : (
        currency0Symbol && (
          <CurrencyLogo
            style={{ marginRight: "8px" }}
            currency={getCurrentToken({ symbol: currency0Symbol } as Currency)}
            size={`36px`}
          />
        )
      )}
      <AutoColumn gap="6px" style={{ width: 204, marginRight: 12 }}>
        <TYPE.body fontWeight={500} fontSize={16}>
          {title?.length && success ? title?.[0] : title?.[1]}
        </TYPE.body>
        {success ? (
          <StyledLink target="_target" href={getEtherscanLink(chainId, hash, "transaction")}>
            {/* 暂时 */}
            {/* {summary ?? "Hash: " + hash.slice(0, 8) + "..." + hash.slice(58, 65)} */}
            <BlackFlex align="center">
              View on Explorer <ChevronRight className="black-icon" size={14} />
            </BlackFlex>
          </StyledLink>
        ) : (
          <TYPE.body fontWeight={400} fontSize={13} color={"rgba(2, 6, 23, 0.5)"}>
            Please try again with a larger quantity.
          </TYPE.body>
        )}
      </AutoColumn>
      {success ? (
        <SvgIcon name="check-circle" size={24} style={{ color: "#2EB246" }} />
      ) : (
        <SvgIcon name="close_circle_err" size={24} style={{ color: "#FF4281" }} />
      )}
    </RowNoFlex>
  );
}
