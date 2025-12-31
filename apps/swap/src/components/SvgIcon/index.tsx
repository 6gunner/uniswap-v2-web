import "virtual:svg-icons-register";
import { useMemo } from "react";
import React from "react";

type SvgIconProps = {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
  onClick?: (e: any) => void;
};

export const SvgIcon = React.memo(
  ({ name, style = {}, onClick, size = 16, ...otherProps }: SvgIconProps) => {
    const symbolId = `#icon-${name}`;
    return (
      <svg
        {...otherProps}
        style={{ width: size, height: size, ...style }}
        aria-hidden="true"
        onClick={onClick}
      >
        <use href={symbolId} />
      </svg>
    );
  }
);
