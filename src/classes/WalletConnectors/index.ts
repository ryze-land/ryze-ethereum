import { icons } from '../../assets/icons/icons'

import { MetaMaskConnector } from './MetaMaskConnector'
import { SafePalConnector } from './SafePalConnector'
import { BitgetConnector } from './BitgetConnector'
import { TrustWalletConnector } from './TrustWalletConnector'
import { CoinbaseConnector } from './CoinbaseConnector'

export * from './WalletConnector'
export * from './WalletConnector__disconnect'
export * from './BrowserConnector'
export * from './WalletConnectConnector'

export const metamaskWalletConnector = new MetaMaskConnector({ icon: icons.metamask })
export const bitgetConnector = new BitgetConnector({ icon: icons.bitkeep })
export const safePalConnector = new SafePalConnector({ icon: icons.safepal })
export const trustWalletConnector = new TrustWalletConnector({ icon: icons.trustwallet })
export const coinbaseConnector = new CoinbaseConnector({ icon: icons.coinbasewallet })

export const defaultWalletConnectors = [
    metamaskWalletConnector,
    bitgetConnector,
    safePalConnector,
    trustWalletConnector,
    coinbaseConnector,
]

export {
    MetaMaskConnector,
    BitgetConnector,
    SafePalConnector,
    TrustWalletConnector,
    CoinbaseConnector,
}
