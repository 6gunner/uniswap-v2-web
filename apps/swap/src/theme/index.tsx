import { transparentize } from "polished";
import React, { useMemo } from "react";
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme,
} from "styled-components";
import { useIsDarkMode } from "../state/user/hooks";
import { Text, TextProps } from "rebass";
import { Colors } from "./styled";
import bg from "../assets/images/bodybg.png?url";

export * from "./components";

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 600,
  upToMedium: 960,
  upToLarge: 1280,
};

const mediaWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css;
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  (accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `;
  return accumulator;
}, {}) as any;

const white = "#FFFFFF";
const black = "#000000";

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? "#FFFFFF" : "#0E111B",
    text2: darkMode ? "#C3C5CB" : "#565A69",
    text3: darkMode ? "#6C7284" : "rgba(0,0,0,0.6)",
    text4: darkMode ? "#565A69" : "rgba(0,0,0,0.5)",
    text5: darkMode ? "#2C2F36" : "#EDEEF2",
    text6: "#4AA1CA",

    // backgrounds / greys
    bg1: darkMode ? "#212429" : "#FFFFFF",
    bg2: darkMode ? "#2C2F36" : "#F7F8FA",
    bg3: darkMode ? "#40444F" : "rgba(0,0,0,0.2)",
    bg4: darkMode ? "#565A69" : "rgba(0,0,0,0.05)",
    bg5: darkMode ? "#6C7284" : "#888D9B",

    //specialty colors
    modalBG: darkMode ? "rgba(0,0,0,.425)" : "rgba(0,0,0,0.1)",
    advancedBG: darkMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.6)",

    //primary colors
    primary1: darkMode ? "#2172E5" : "#D93757",
    primary2: darkMode ? "#3680E7" : "#E4FF7A",
    primary3: darkMode ? "#4D8FEA" : "#FFFFFF",
    primary4: darkMode ? "#376bad70" : "#F2FFBF",
    primary5: darkMode ? "#153d6f70" : "#F8FFE6",

    // color text
    primaryText1: darkMode ? "#6da8ff" : "#4AA1CA",

    // secondary colors
    secondary1: darkMode ? "#2172E5" : "#D9FF42",
    secondary2: darkMode ? "#17000b26" : "#F2FFBF",
    secondary3: darkMode ? "#17000b26" : "#F8FFE6",

    // other
    errorRed: "#CF1150",
    red1: "rgba(204, 204, 204, 0.5)",
    red2: "#F82D3A",
    green1: "#64E196",
    yellow1: "#FFE270",
    yellow2: "#EDC577",

    divider: darkMode ? "rgba(43, 43, 43, 0.435)" : "rgba(0,0,0,0.1)",
    link: "#2172E5",

    borderColor: "rgba(255, 255, 255, 0.30)",

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
  };
}

export function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? "#000" : "#2F80ED",

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  };
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode();

  const themeObject = useMemo(() => theme(darkMode), [darkMode]);

  return (
    <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
  );
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => {
    return theme[color];
  }};
`;

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"text4"} {...props} />;
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"primary1"} {...props} />;
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"text1"} {...props} />;
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={"text1"} {...props} />;
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />;
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />;
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />;
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"primary1"} {...props} />;
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"yellow1"} {...props} />;
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"text3"} {...props} />;
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"bg3"} {...props} />;
  },
  italic(props: TextProps) {
    return (
      <TextWrapper fontWeight={500} fontSize={12} fontStyle={"italic"} color={"text2"} {...props} />
    );
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? "red1" : "text2"} {...props} />;
  },
  light({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={400} color={"text3"} fontSize={14} {...props} />;
  },
  small({ ...props }: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} color={"text1"} {...props} />;
  },
};

export const FixedGlobalStyle = createGlobalStyle`

html, input, textarea, button {
    font-family: Comfortaa;
  letter-spacing: -0.018em;
  font-display: fallback;
}
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: Comfortaa;
  }
}


html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
   height: 100%;
}

* {
  box-sizing: border-box;
}

*::-webkit-scrollbar {
  display: none;
}

button {
  user-select: none;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
`;

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.white};
}

body {
  min-height: 100%;
  // background-position: 0 -30vh;
  // background-repeat: no-repeat;
  // background: url(${bg});
  // background-size: cover;
  background: #4AA1CA;
}
`;
