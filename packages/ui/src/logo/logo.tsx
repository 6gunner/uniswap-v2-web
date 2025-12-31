import * as DotLottieReactImport from "@lottiefiles/dotlottie-react";
import { CSSProperties, useEffect, useState } from "react";
import { createStyles } from "antd-style";
import clsx from "clsx";
import LogoImg from "./sugarLogo.png";
import LogoTextJson from "./Sugar-font.json";
import LogoStarJson from "./Sugar-star.json";

interface Props {
  className?: string;
  width: number;
  height: number;
  style?: CSSProperties;
  onlyText?: boolean;
}

export const useStyles = createStyles(({ css, responsive }) => ({
  wrapper: css`
    position: relative;
    .star {
      width: ${(30 / 88) * 100}%;
      height: ${(30 / 88) * 100}%;
      position: absolute;
      top: ${(10 / 88) * 100}%;
      left: -${(5 / 88) * 100}%;
      z-index: 2;
    }
    .img,
    .text {
      transition: opacity 0.2s ease-in-out;
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 1;
    }

    .img {
      opacity: 1;
    }

    .text {
      opacity: 0;
      width: calc(100% * 1.3);
      transform: translateX(-50%);
      left: 50%;
    }

    &:hover {
      .img,
      .star {
        opacity: 0;
      }
      .text {
        opacity: 1;
      }
    }
  `,
}));

const DotLottieReact = DotLottieReactImport.DotLottieReact as any;

const Logo = ({ className, style, width, height, onlyText = false }: Props) => {
  const { styles } = useStyles();
  const [dotLottie, setDotLottie] = useState<DotLottieReactImport.DotLottie | null>(null);
  useEffect(() => {
    if (dotLottie) {
      dotLottie?.play();
    }
  }, [dotLottie]);
  return (
    <div className={clsx(styles.wrapper, className)} style={{ width, height, ...style }}>
      {!onlyText ? (
        <>
          <DotLottieReact autoplay loop className="star" data={LogoStarJson} />
          <img className="img" src={LogoImg} alt="logo" />
          <DotLottieReact
            dotLottieRefCallback={setDotLottie}
            mode={"forward"}
            className="text"
            onMouseEnter={() => {
              dotLottie?.play();
            }}
            onMouseLeave={() => {
              dotLottie?.stop();
            }}
            data={LogoTextJson}
            style={{ width, height }}
          />
        </>
      ) : (
        <DotLottieReact
          dotLottieRefCallback={setDotLottie}
          autoplay
          mode={"forward"}
          data={LogoTextJson}
          style={{ width, height }}
        />
      )}
    </div>
  );
};

export default Logo;
