import { ThemeConfig } from 'antd';
import { createGlobalStyle } from 'antd-style';

/**
 * antd的样式
 */

const primaryBlack = '#fff';
const primaryGradient = '#333330';
const whiteColor = '#fff';
const colorBgContainer = '#4AA1CA';
const colorBorder = 'var(--black-opacity-3)';
const theme: ThemeConfig = {
  token: {
    fontFamily: 'Poppins',
    colorPrimary: primaryBlack,
    colorText: primaryBlack,
    colorPrimaryBgHover: primaryGradient,
    colorLinkHover: primaryGradient,
    colorBorder: colorBorder,
    // 派生
    colorBgContainer: colorBgContainer,
    colorBgBase: whiteColor, // 派生色，默认就是#fff
    colorTextBase: whiteColor, // 用于部分黑底白字
    colorTextDescription: 'var(--black-opacity-6)',
  },
  components: {
    Button: {},
    Modal: {},
    Input: {},
    Tooltip: {},
  },
};

const Global = createGlobalStyle`
* {
  box-sizing: border-box;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root {
  --primary-gradient: linear-gradient(90deg, ${primaryBlack} 0.18%, ${primaryBlack} 99.9%);
  --primary-color: ${primaryBlack};
  --black-opacity-9: rgba(20, 20, 19, 0.9);
  --black-opacity-8: rgba(20, 20, 19, 0.8);
  --black-opacity-7: rgba(20, 20, 19, 0.7);
  --black-opacity-6: rgba(20, 20, 19, 0.6);
  --black-opacity-5: rgba(20, 20, 19, 0.5);
  --black-opacity-4: rgba(20, 20, 19, 0.4);
  --black-opacity-3: rgba(20, 20, 19, 0.3);
  --black-opacity-2: rgba(20, 20, 19, 0.2);
  --black-opacity-1: rgba(20, 20, 19, 0.1);
  --black-opacity-05: rgba(20, 20, 19, 0.05);
  --black-opacity-03: rgba(20, 20, 19, 0.03);
}

html, body, #root {
  background: ${colorBgContainer};
  font-size: 16px;
  color: ${primaryBlack};
  scrollbar-width: none;
  font-family: Comfortaa;
}
::-webkit-scrollbar {
    display: none;
}

a {
  color: var(--black-opacity-8);
}

a:hover {
  color: ${primaryGradient};
}

.container {
  width: 1240px;
  padding: 0 20px;
  margin: 0 auto;
}

svg {
  display: block;
}

@media screen and (max-width: 767px) {
  .container {
    width: 100%;
    padding: 0 14px 0;
  }
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.elp {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.position-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%);
}

.gradient-bg {
  background: var(--primary-gradient);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ant-message {
  top: 80px !important;
  .ant-message-notice-wrapper {
    .ant-message-notice-content {
      padding: 9px 16px;
      border: 1px solid rgba(255, 255, 255, 0.10);
      background: ${whiteColor};
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.10);
      color: ${primaryBlack};
      .ant-message-warning {
        .anticon-exclamation-circle {
          color: #ee8432;
        }
      }
    }
  }
  .ant-message-custom-content {
    display: flex;
    gap: 8px;
      .anticon {
        margin-inline-end: 0 !important;
      }
  }
}
`;

export { theme, Global };
