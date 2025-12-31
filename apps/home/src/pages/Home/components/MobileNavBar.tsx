import { useToggle } from 'ahooks';
import { ConfigProvider, Dropdown } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { memo, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SvgIcon from '@/components/SvgIcon';
import { URL_MAP } from '../config';

const useStyles = createStyles(({ css, token }) => ({
  wrapper: css`
    position: relative;
  `,
  overlay: css`
    width: 100%;
    position: absolute;
    z-index: 1;
    inset: 72px 0 0 0 !important;
    .sugar-dropdown-menu {
      height: calc(100vh - 72px);
      padding: 0 16px;
      background: ${token.colorBgContainer};
      border-radius: 0;
      opacity: 1;
      box-shadow: none;
      display: flex;
      flex-direction: column;
      .sugar-dropdown-menu-item {
        padding: 20px 0;
        font-size: 18px;
        background: none;
        border-bottom: 1px solid var(--black-opacity-1);
        .sugar-dropdown-menu-title-content {
          span {
            font-weight: 400;
          }
        }
        &:last-child {
          padding: 28px 0;
          border-bottom: none;
          flex: 1;
          display: flex;
          flex-direction: column;
          .sugar-dropdown-menu-title-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 100%;
          }
        }
      }
    }
    .link {
      height: 44px;
      padding: 8px 16px 8px 12px;
      border: 1px solid var(--black-opacity-3);
      border-radius: 91px;
      cursor: pointer;
      display: flex;
      gap: 10px;
      align-items: center;
      color: ${token.colorText};
      font-weight: 500;
      &:hover {
        border: 1px solid ${token.colorText};
      }
      img {
        width: 28px;
      }
    }
  `,
  logout: css`
    width: 100%;
    height: 44px;
    border: 1px solid ${token.colorBorder};
    color: ${token.colorText};
    font-weight: 500;
  `,
}));

interface IMobileNavBar {
  callback: (status: boolean) => void;
}

const MobileNavBar = memo((props: IMobileNavBar) => {
  const { styles } = useStyles();
  const token = useTheme();
  const [isOpen, { toggle }] = useToggle(false);
  const navigate = useNavigate();
  const { callback } = props;

  useEffect(() => {
    callback(isOpen);
  }, [isOpen, callback]);

  const items = useMemo(() => {
    return [
      ...URL_MAP.map(u => ({
        ...u,
        label: (
          <span
            onClick={() => {
              navigate(u.key!);
              toggle();
            }}
          >
            {u.label}
          </span>
        ),
      })),
      {
        key: 'login',
        label: (
          <>
            <div></div>
          </>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Dropdown: {
            borderRadius: 0,
            colorPrimary: 'none',
          },
        },
      }}
    >
      <div className="dropdown-wrap">
        <Dropdown
          menu={{
            items,
            selectable: true,
          }}
          open={isOpen}
          className={styles.wrapper}
          overlayClassName={styles.overlay}
          getPopupContainer={() => document.querySelector('.dropdown-wrap')!}
        >
          <SvgIcon
            className="menu"
            style={{ color: token.colorText }}
            name={isOpen ? 'close' : 'menu'}
            width={28}
            height={28}
            onClick={toggle}
          />
        </Dropdown>
      </div>
    </ConfigProvider>
  );
});

export default MobileNavBar;
