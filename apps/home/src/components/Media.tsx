import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';

const useStyles = createStyles(({ css }) => ({
  wrapper: css``,
  img: css`
    user-select: none;
    -webkit-user-drag: none;
  `,
  imgSkeleton: css`
    .vezk-skeleton-avatar {
      background: #fff;
    }
  `,
}));

export type MediaProps = JSX.IntrinsicElements['video'] &
  JSX.IntrinsicElements['img'] & { type: 'video' | 'img'; needSkeleton?: boolean };

const Media = memo((props: MediaProps) => {
  const { type, className, needSkeleton = false, ...otherProps } = props;
  const { styles, cx } = useStyles();
  const [loading, setLoading] = useState(true);

  const handleImageLoaded = () => {
    setLoading(false);
  };

  if (type === 'video') {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        className={cx(styles.wrapper, className)}
        {...otherProps}
      />
    );
  } else {
    return (
      <>
        {needSkeleton && loading && (
          <Skeleton.Avatar className={cx(styles.imgSkeleton, className)} shape="circle" active />
        )}
        <img
          className={cx(styles.img, className)}
          {...otherProps}
          style={{
            display: loading ? 'none' : 'inline-block',
          }}
          onLoad={handleImageLoaded}
        />
      </>
    );
  }
});

export default Media;
