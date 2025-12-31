
import { createStyles } from 'antd-style';
import { rgba } from '@/utils';

export const useStyles = createStyles(({ css, responsive }) => ({
  wrapper: css`
    position: relative;
    width: 100%;
    .logo {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      z-index: 4;
    }
    .mp4 {
      position: absolute;
      top: 0;
      z-index: 1;
      width: 100vw;
      height: 100vh;
      left: 50%;
      transform: translateX(-50%);
      ${responsive.sm} {
        height: 100vh;
        svg{
          position: absolute;
          top: -85px;
          left: 0;
        }
      }
    }
    .header {
      height: 127px;
      padding: 16px 24px;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 3;
      ${responsive.sm} {
        height: 76px;
      }
      .nav {
        a {
          color: #fff;
          font-family: Inter;
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
          line-height: 100%;
        }
      }
    }
    .main {
      position: relative;
      z-index: 2;
      width: 100%;
      margin: 0 auto;
      .launch {
        height: 100vh;
        /* padding: 391px 0 0; */
        box-sizing: border-box;
        /* ${responsive.sm} {
          padding: 248px 0 0;
          height: 620px;
        } */
        .placeholder {
          width: 160px;
          height: 160px;
          margin: 0 auto 8px;
          ${responsive.sm} {
            width: 128px;
            height: 128px;
          }
        }
        .title {
          color: #fff;
          text-align: center;
          font-family: Comfortaa;
          font-size: 44px;
          font-style: normal;
          font-weight: 700;
          line-height: 100%;
          padding: 0 0 27px;
          ${responsive.sm} {
            padding: 0 0 31px;
            font-size: 40px;
          }
        }
        .desc {
          color: #fff;
          text-align: center;
          font-family: Comfortaa;
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          line-height: 160%;
          padding: 0 0 49px;
          ${responsive.sm} {
            padding: 0 36px 31px;
          }
        }
        .btn {
          border-radius: 14px;
          background: #fff;
          width: 180px;
          height: 48px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          /* .b {
            display: none;
          } */
          &:hover {
            background: ${rgba('#fff', 0.8)};
            /* .a {
              display: none;
            }
            .b {
              display: block;
            } */
          }
          div {
            color: #4AA1CA;
            text-align: center;
            font-family: Comfortaa;
            font-size: 18px;
            font-style: normal;
            font-weight: 700;
            line-height: 100%; /* 18px */
          }
          svg {
            width: 20px;
            height: 20px;
            color: #4AA1CA;
          }
        }
      }
      .features {
        margin: 0 0 26px;
        .title {
          color: #fff;
          text-align: center;
          font-family: Comfortaa;
          font-size: 44px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%;
          padding: 80px 0 0;
          ${responsive.sm} {
            font-size: 36px;
            padding: 15px 0 0;
          }
        }
        .items {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          & > div {
            &:not(:nth-child(2)) {
              margin: -94px 0 0;
              ${responsive.sm} {
                margin: 0;
              }
            }
            padding: 0 10px;
            flex: 1;
            ${responsive.sm} {
              padding: 0;
            }
          }
          .tit {
            text-align: center;
            font-family: Comfortaa;
            font-size: 24px;
            font-style: normal;
            font-weight: 600;
            line-height: 160%;
            /* span {
              color: #f14063;
              font-family: Comfortaa;
              font-weight: 600;
            } */
          }
          .desc {
            color: ${rgba('#fff', 0.6)};
            text-align: center;
            font-family: Inter;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 160%;
          }
        }
      }
      .roadmap {
        height: 780px;
        ${responsive.sm} {
          height: 880px;
        }
        .title {
          color: #fff;
          text-align: center;
          font-family: Comfortaa;
          font-size: 44px;
          font-style: normal;
          font-weight: 700;
          line-height: 160%;
          padding: 214px 0 0;
          ${responsive.sm} {
            font-size: 36px;
            padding: 59px 0 0;
          }
        }
        .items {
          max-width: 1200px;
          margin: 0 auto;
          & > div {
            padding: 26px 24px;
            flex: 1;
            ${responsive.sm} {
              padding: 0;
            }
            &:first-child {
              width: 377px;
              ${responsive.sm} {
                width: auto;
              }
            }
            &:not(:first-child) {
              flex: 1;
            }
          }
          .tit {
            @media (max-width: 1120px) {
              flex-direction: column;
              align-items: flex-start;
            }
            ${responsive.sm} {
              flex-direction: row;
              align-items: center
            }
            .txt {
              color: #fff;
              font-family: Comfortaa;
              font-weight: 600;
              font-size: 24px;
              line-height: 160%;
            }
            .status {
              border-radius: 100px;
              background: ${rgba('#fff', 0.1)};
              color: #fff;
              text-align: center;
              font-family: Comfortaa;
              font-size: 14px;
              display: inline-flex;
              padding: 0 8px;
              justify-content: center;
              align-items: center;
              gap: 3px;
              height: 24px;
              &:before {
                content: ' ';
                display: block;
                width: 5px;
                height: 5px;
                border-radius: 5px;
                background: #fff;
              }
              /* &.Live {
                background: ${rgba('#D93757', 0.1)};
                color: #d93757;
                &:before {
                  background: #d93757;
                }
              } */
            }
          }
          .item {
            color: ${rgba('#fff', 0.6)};
            font-family: Inter;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 160%;
            &:before {
              content: ' ';
              display: block;
              width: 5px;
              height: 5px;
              border-radius: 5px;
              background: ${rgba('#fff', 0.6)};
            }
          }
        }
      }
    }
    .launch2{
      @media (max-width: 1264px) {
        margin: 0 32px;
      }
      &>div {
        border-radius: 40px;
        border: 1px solid ${rgba('#fff', 0.1)};
        backdrop-filter: blur(60px);
        max-width: 1200px;
        height: 360px;
        margin: 0 auto 13px;
        box-sizing: border-box;
        padding: 80px 32px;
        width: 100%;
      }
      ${responsive.sm} {
        height: auto;
        padding: 60px 20px;
        margin: 0 24px;
      }
      .title {
        color: #fff;
        text-align: center;
        font-family: Comfortaa;
        font-size: 44px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 44px */
        padding: 0 0 27px;
        ${responsive.sm} {
          font-size: 36px;
          padding: 0 0 24px;
        }
      }
      .desc {
        color: #fff;
        text-align: center;
        font-family: Comfortaa;
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 160%;
        padding: 0 0 49px;
        ${responsive.sm} {
          padding: 0 0 24px;
        }
      }
      .btn {
        border-radius: 14px;
        background: #fff;
        width: 180px;
        height: 48px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        /* .b {
          display: none;
        } */
        &:hover {
          background: ${rgba('#fff', 0.8)};
          /* .a {
            display: none;
          }
          .b {
            display: block;
          } */
        }
        div {
          color: #4AA1CA;
          text-align: center;
          font-family: Comfortaa;
          font-size: 18px;
          font-style: normal;
          font-weight: 700;
          line-height: 100%; /* 18px */
        }
        svg {
          width: 20px;
          height: 20px;
          color: #4AA1CA;
        }
      }
    }
    .footer {
      /* height: 320px; */
      padding: 0 32px;
      /* ${responsive.sm} {
        height: 400px;
      } */
      .box {
        width: 100%;
        padding: 0 0 20px 0;
        box-sizing: border-box;
        ${responsive.sm} {
          padding: 0 24px 20px 24px;
        }
        .txt {
          color: #fff;
          text-align: center;
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 160%; /* 25.6px */
        }
        svg {
          width: 28px;
          height: 28px;
        }
      }
    }
  `,
}));