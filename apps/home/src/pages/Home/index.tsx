import { Flex } from 'antd';
import { memo, useState, useEffect, useRef } from 'react';
import { useScroll } from 'ahooks';

import { useResponsive } from 'antd-style';
import classNames from 'classnames';
import Icon from '@/components/SvgIcon';

import Sugar from './sugar_kv_motion.json';
import SugarMobile from './sugar_kv_motion_mobile.json';
import { SUGAR_DOMAIN } from '@repo/consts';
import { useStyles } from './index.style';
import { features, roadmap } from './config';
// import MobileNavBar from './components/MobileNavBar';
// import PcNavBar from './components/PcNavBar';
import { Logo } from '@repo/ui';
import Lottie from 'lottie-react';

const Home = memo(() => {
  const { styles } = useStyles();
  const { md } = useResponsive();
  const scroll = useScroll(document);
  const ref = useRef<HTMLDivElement>(null);
  const [logoPlaceholderTop, setPlaceholderLogoTop] = useState(0);
  const [logoTop, setLogoTop] = useState(171);
  const [width, setWidth] = useState(160);

  // const [status, setStatus] = useState(false);

  // useEffect(() => {
  //   if (status && !md) {
  //     setWidth(40);
  //   } else {
  //     setWidth(Math.max(150 - (scroll?.top || 0) * 0.3, md ? 90 : 40));
  //   }
  // }, [scroll, md, status]);

  useEffect(() => {
    const lT = ref.current?.offsetTop || 0;
    const maxW = md ? 160 : 128;
    const minW = md ? 90 : 60;
    const sT = scroll?.top || 0;
    setLogoTop(lT - sT);
    setWidth(Math.max(maxW - sT * 0.3, minW));
  }, [scroll, md, logoPlaceholderTop]);

  const handleResize = () => {
    if (ref.current) {
      setPlaceholderLogoTop(ref.current.offsetTop);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={classNames(styles.wrapper)}>
      <Logo
        className="logo"
        width={88}
        height={88}
        style={{ top: logoTop > (md ? 16 : 8) ? logoTop : md ? 16 : 8, width, height: width }}
      />
      {md ? (
        <Flex justify="center" className="mp4">
          <Lottie animationData={Sugar} autoPlay loop={false} />
        </Flex>
      ) : (
        <Flex justify="center" className="mp4">
          <Lottie animationData={SugarMobile} autoPlay />
        </Flex>
      )}
      <Flex
        className="header"
        justify="space-between"
        align="center"
        style={(scroll?.top || 0) > 16 ? { background: '#4AA1CA' } : {}}
      >
        {/* {md ? <PcNavBar /> : <MobileNavBar callback={isOpen => setStatus(isOpen)} />} */}
        <div></div>
        <div></div>
      </Flex>
      <Flex vertical className="main">
        <Flex align="center" justify="center" className="launch">
          <Flex vertical>
            <div className="placeholder" ref={ref}></div>
            <Flex justify="center" className="title">
              treat yourself
            </Flex>
            <Flex justify="center" className="desc">
              The sweetest way to trade, swap, pool and stake AI and traditional assets.
            </Flex>
            <Flex justify="center">
              <a href={SUGAR_DOMAIN} className="btn" target="__blank">
                <Flex align="center" justify="center" className="a">
                  Launch App
                </Flex>
              </a>
            </Flex>
          </Flex>
        </Flex>
        <Flex className="features" vertical gap={md ? 70 : 40}>
          <Flex justify="center" className="title">
            features
          </Flex>
          <Flex gap={40} className="items" vertical={!md}>
            {features.map((i, n) => (
              <Flex key={n} gap={18} vertical>
                <Flex justify="center" className="img">
                  <img src={i.img.url} height={i.img.height} width={i.img.width} alt="" />
                </Flex>
                <Flex gap={14} vertical>
                  <div className="tit">{i.title}</div>
                  <div className="desc">{i.description}</div>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex className="roadmap" vertical gap={md ? 75 : 66}>
          <Flex justify="center" className="title">
            roadmap
          </Flex>
          <Flex justify="space-between" className="items" gap={md ? 10 : 66} vertical={!md}>
            {roadmap.map((i, n) => (
              <Flex key={`${i.title}_${n}`} gap={16} vertical>
                <Flex className="tit" align="center" gap={12}>
                  <span className="txt">{i.title}</span>
                  <span className={classNames('status', `${i.status.replace(' ', '')}`)}>{i.status}</span>
                </Flex>
                <Flex gap={12} vertical>
                  {i.items.map(s => (
                    <Flex gap={12} align="center" className="item" key={s.title}>
                      {s.title}
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
      {/* <Flex className="launch2">
        <Flex vertical>
          <Flex justify="center" className="title">
            treat yourself
          </Flex>
          <Flex justify="center" className="desc">
            The sweetest way to trade, swap, pool and stake AI and traditional assets.
          </Flex>
          <Flex justify="center">
            <Flex className="btn" align="center" justify="center">
              <Flex align="center" justify="center" className="a">
                Launch App
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex> */}
      <Flex className="footer" align="end">
        <Flex className="box" justify="space-between" align="center" vertical={!md} gap={34}>
          {!md ? <Logo width={88} height={88} onlyText /> : null}
          <Flex flex={1} className="txt">
            © 2024 Sugar Finance
          </Flex>
          {md ? <Logo width={88} height={88} onlyText /> : null}
          <Flex flex={1} justify="end" className="txt">
            <Icon name="x" />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
});

export default Home;
