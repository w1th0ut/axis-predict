import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

const RPC_URLS = {
  testnet: "https://fullnode.testnet.sui.io:443",
} as const;

export const dAppKit = createDAppKit({
  networks: ["testnet"] as const,
  defaultNetwork: "testnet",
  createClient: (network) =>
    new SuiJsonRpcClient({
      network,
      url: RPC_URLS[network],
    }),
  autoConnect: true,
  slushWalletConfig: null,
});

declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
