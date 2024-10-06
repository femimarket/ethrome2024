import { http, cookieStorage, createConfig, createStorage, webSocket } from 'wagmi'
import { Chain, mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors'


export const localFhenix = {
  id: 412346,
  name: 'LocalFhenix',
  nativeCurrency: { name: 'Ether', symbol: 'FHE', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:42069'], webSocket: ['ws://localhost:42070'] },
  },
} as const satisfies Chain

export function getConfig() {
  return createConfig({
    syncConnectedChain: true,

    chains: [localFhenix],
    connectors: [
      metaMask(),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [localFhenix.id]: webSocket(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
