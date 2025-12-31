import React, { useState, useEffect } from 'react';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, responsive }) => ({
  wrapper: css`
    position: relative;
    .item {
      width: 50px;
      height: 50px;
      background-color: blue;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      animation: drop 1s forwards cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }

    @keyframes drop {
      to {
        top: 400px; /* 控制物品掉落的高度 */
      }
    }

    .dropped {
      animation: bounce 0.5s alternate infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }

    @keyframes bounce {
      to {
        top: 400px; /* 控制物品弹跳的高度 */
      }
    }

    .stopped {
      animation: none;
      top: 400px; /* 控制物品停在底部的位置 */
    }
  `,
}));

const DropItem = () => {
  const { styles } = useStyles();

  const [dropped, setDropped] = useState(false);
  const [bounces, setBounces] = useState(0);

  useEffect(() => {
    if (!dropped) {
      setTimeout(() => {
        setDropped(true);
      }, 1000); // 1秒后开始掉落
    }
  }, [dropped]);

  useEffect(() => {
    if (dropped && bounces < 3) {
      // 设置最大弹跳次数
      const randomBounces = Math.floor(Math.random() * 3) + 1; // 随机弹跳次数，最多3次
      const bounceTimeout = setTimeout(() => {
        setBounces(bounces + 1);
      }, 500); // 每次弹跳间隔0.5秒
      return () => clearTimeout(bounceTimeout);
    }
  }, [dropped, bounces]);

  return (
    <div className={styles.wrapper}>
      <div
        className={`item ${dropped ? 'dropped' : ''} ${bounces > 0 ? 'bouncing' : ''} ${bounces >= 3 ? 'stopped' : ''}`}
      >
        Item
      </div>
    </div>
  );
};

export default DropItem;
