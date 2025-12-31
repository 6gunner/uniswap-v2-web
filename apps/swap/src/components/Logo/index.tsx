import { useState } from "react";
import { ImageProps } from "rebass";
import defaultIcon from "@src/assets/images/default-icon.svg?url";
const BAD_SRCS: { [tokenAddress: string]: true } = {};

export interface LogoProps extends Pick<ImageProps, "style" | "alt" | "className"> {
  srcs: string[];
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, ...rest }: LogoProps) {
  const [, refresh] = useState<number>(0);

  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src]);
  if (!src) {
    return <img {...rest} alt={alt} src={defaultIcon} />;
  }
  return (
    <img
      {...rest}
      alt={alt}
      src={src}
      onError={() => {
        if (src) BAD_SRCS[src] = true;
        refresh((i) => i + 1);
      }}
    />
  );
}
