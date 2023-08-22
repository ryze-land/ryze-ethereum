import {
    BitgetWallet,
    MetaMaskWallet,
    SafePalWallet,
    TrustWallet,
} from '../classes'
import { icons } from './icons/icons'

export const defaultWalletConnectors = [
    new MetaMaskWallet({ icon: icons.metamask }),
    new BitgetWallet({ icon: icons.bitkeep }),
    new SafePalWallet({ icon: icons.safepal }),
    new TrustWallet({ icon: icons.trustwallet }),
]
