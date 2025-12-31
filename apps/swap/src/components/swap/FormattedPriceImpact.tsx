import { Percent } from "@repo/sugar-finance-sdk";
import React from "react";
import { ONE_BIPS } from "../../constants";
import { warningSeverity } from "../../utils/prices";
import { ErrorText } from "./styleds";
import { AlertTriangle } from "react-feather";

/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
  const severity = warningSeverity(priceImpact);
  return (
    <ErrorText fontWeight={500} fontSize={14} severity={severity}>
      {severity > 2 && <AlertTriangle size={14} />}
      {priceImpact
        ? priceImpact.lessThan(ONE_BIPS)
          ? "<0.01%"
          : `${priceImpact.toFixed(2)}%`
        : "-"}
    </ErrorText>
  );
}
