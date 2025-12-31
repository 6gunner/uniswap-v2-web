import { Flex } from 'antd';
import cls from 'classnames';
import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { URL_MAP } from '../config';

const PcNavBar = memo(() => {
  const { pathname } = useLocation();
  const pathnameArr = pathname.split('/');

  return (
    <Flex className="pc-nav-bar" gap={48}>
      {URL_MAP.map(({ key, label }) => {
        return (
          <Link
            key={label}
            to={`${key}`}
            className={cls('flex', 'items-center', {
              active: pathnameArr.length && `/${pathnameArr[1]}` === key,
            })}
          >
            {label}
          </Link>
        );
      })}
    </Flex>
  );
});

export default PcNavBar;
