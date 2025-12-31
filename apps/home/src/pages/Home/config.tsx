// import { SUGAR_DOMAIN } from '@repo/consts';
import featuresImg1 from '@/assets/images/1.png';
import featuresImg2 from '@/assets/images/2.png';
import featuresImg3 from '@/assets/images/3.png';

// export const URL_MAP = [
//   {
//     key: `${SUGAR_DOMAIN}/swap`,
//     label: 'Swap',
//   },
//   {
//     key: `${SUGAR_DOMAIN}/pool`,
//     label: 'Pool',
//   },
// ];

export const features = [
  {
    img: {
      url: featuresImg1,
      width: 120,
      height: 120,
    },
    title: (
      <>
        <span>Privacy</span>-first trades
      </>
    ),
    description: 'Privacy-preserving tech keeps users trades, history and strategies confidential at all times.',
  },
  {
    img: {
      url: featuresImg2,
      width: 120,
      height: 120,
    },
    title: 'Fiat onramps',
    description: 'Smooth entry into a secure and efficient trading environment for retail and Insto alike.',
  },
  {
    img: {
      url: featuresImg3,
      width: 120,
      height: 120,
    },
    title: (
      <>
        Better tasting <span>UX</span>
      </>
    ),
    description: 'zkLogin makes account signup, management and transactions seamless, private and secure.',
  },
];

export const roadmap = [
  {
    title: 'Testnet',
    status: 'Live',
    items: [
      {
        title: 'Intuitive UI',
      },
      {
        title: 'Deep liquidity pools',
      },
      {
        title: 'Easy executions',
      },
    ],
  },
  {
    title: 'Sugar Mainnet',
    status: 'coming soon',
    items: [
      {
        title: 'Privacy-first trades',
      },
      {
        title: 'Fiat onramps',
      },
      {
        title: 'zkLogin accounts',
      },
    ],
  },
  {
    title: 'Sugar Mainnet',
    status: 'coming soon',
    items: [
      {
        title: 'AI-trading strategies',
      },
      {
        title: 'Market adaptability',
      },
      {
        title: 'Sophisticated tools',
      },
    ],
  },
];
