import { DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { CSSProperties, useEffect, useState } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}
const LottieLogo = ({ className, style }: Props) => {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  useEffect(() => {
    if (dotLottie) {
      dotLottie?.play();
    }
  }, [dotLottie]);
  return (
    <DotLottieReact
      dotLottieRefCallback={setDotLottie}
      mode={"forward"}
      className={className}
      onMouseEnter={() => {
        dotLottie?.play();
      }}
      onMouseLeave={() => {
        dotLottie?.stop();
      }}
      src="/Sugar-font.json"
      style={style}
    />
  );
};

export default LottieLogo;
