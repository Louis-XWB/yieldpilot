import { getDefaultConfig } from "@rainbow-me/rainbowkit";
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

export const config = getDefaultConfig({
  appName: "YieldPilot",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [
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
  ],
  ssr: true,
});
