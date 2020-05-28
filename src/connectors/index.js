import { NetworkConnector } from '@web3-react/network-connector'
import { InjectedConnector } from './Injected'
import NetworkWithSignerConnector from './NetworkWithSigner'
import { WalletConnectConnector } from './Walletconnect'

const POLLING_INTERVAL = 8000
const RPC_URLS = {
  1: process.env.REACT_APP_NETWORK_URL,
  4: 'https://rinkeby.infura.io/v3/a28f35f70591419cbf422c5e58cd047d',
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 4],
})

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  defaultChainId: 1,
  pollingInterval: POLLING_INTERVAL,
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

export const getNetworkWithSigner = privateKey => {
  return new NetworkWithSignerConnector({
    privateKey,
    urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
    defaultChainId: 1,
    pollingInterval: POLLING_INTERVAL,
  })
}
