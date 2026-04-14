import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  injectedWallet,
  walletConnectWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import {
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  avalanche,
  bsc,
  gnosis,
  linea,
  scroll,
  mantle,
  celo,
} from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        injectedWallet,
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "YieldPilot",
    projectId,
  }
);

const chains = [
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  avalanche,
  bsc,
  gnosis,
  linea,
  scroll,
  mantle,
  celo,
] as const;

export const config = createConfig({
  connectors,
  chains,
  transports: {
    [mainnet.id]: http("https://rpc.ankr.com/eth"),
    [base.id]: http("https://mainnet.base.org"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [optimism.id]: http("https://mainnet.optimism.io"),
    [polygon.id]: http("https://polygon-rpc.com"),
    [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
    [gnosis.id]: http("https://rpc.gnosischain.com"),
    [linea.id]: http("https://rpc.linea.build"),
    [scroll.id]: http("https://rpc.scroll.io"),
    [mantle.id]: http("https://rpc.mantle.xyz"),
    [celo.id]: http("https://forno.celo.org"),
  },
  ssr: true,
});
