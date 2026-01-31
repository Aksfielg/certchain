import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

// 1. Get projectId from https://cloud.walletconnect.com
// TODO: Replace with your actual projectId
const projectId = 'cba59995539133b59c046e89751e3919';

// 2. Create wagmiConfig
const metadata = {
  name: 'CertChain',
  description: 'A decentralized certificate verification system',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const amoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: ['https://rpc-amoy.polygon.technology/'] },
    default: { http: ['https://rpc-amoy.polygon.technology/'] },
  },
  blockExplorers: {
    etherscan: { name: 'PolygonScan', url: 'https://www.oklink.com/amoy' },
    default: { name: 'PolygonScan', url: 'https://www.oklink.com/amoy' },
  },
  contracts: {},
};

const chains = [amoy];
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96' // MetaMask
  ]
});
