## 部署到EXP

## 部署到EXP

合约地址：

```
PandraFactory: 0xD9DE339FafaE9f2f0a6d133975f2A4582e84989E

initCodeHash: 0x2c836e67a334fa6040d43cfbbad07329a1ab80db49d42db16fc81f3f47e14b8e //sdk/constant

PandraRouter: 0xD5af491Fa0A4E8EC54Bc8D133a1f84a505a865b4  //web/src/constants

// web/src/constants/multicall/index.ts
Multicall: 0xa966BDF2e0088eb921A39d6ff684b60388Fc277e

```

token

```
WZKJ:0xB671A1B90CD11Fb9554F6BA8bad1cc13129E3BB2 // sdk/src/entities/token.ts

// expTokenList
zkjUSDT: 0xE8Dac247ff7b2E59Dd1dE7a3FF021E425bA5DEfc    精度18
zkjPEPE: 0x3BD9fed87256E81FaB0848507E972cdd92Cd43f4
zkjPNUT: 0x505aC7167c9561B79735fe94c394084651a9c7dd
REX: 0xa12964B1cE252FBB78Ff74947C42259682CC24FF

     {
       "chainId": 18880,
       "address": "0xE8Dac247ff7b2E59Dd1dE7a3FF021E425bA5DEfc",
       "name": "zkjUSDT",
       "symbol": "zkjUSDT",
       "decimals": 18,
       "logoURI": "https://dev.zkj-chain-swap-web.pages.dev/tokenIcons/zkjUSD.png"
     },

    {
      "chainId": 18880,
      "address": "0xa12964B1cE252FBB78Ff74947C42259682CC24FF",
      "name": "REX",
      "symbol": "REX",
      "decimals": 18,
      "logoURI": "https://dev.zkj-chain-swap-web.pages.dev/tokenIcons/REX.png"
    }
```

LP-name

全局替换掉，目前是

```
symbol: SugarFinance-LP
name: SugarFinance LPs
```

graph

`web/src/apollo/queries.ts`

```
client：https://thegraph-subgraphs-testnet.expchain.ai/subgraphs/name/sugar-finance-v2-testnet

blockClient：https://thegraph-subgraphs-testnet.expchain.ai/subgraphs/name/blocklytics/exp-testnet-blocksklytics/exp-testnet-blocks

// src/apollo/queries.ts
subgraphName: "sugar-finance-v2-testnet"

// 记得每次重新部署the graph的时候，更新这个值
export const MIN_BLOCK = 6940000;

```
